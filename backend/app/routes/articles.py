import re
import os
import uuid
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.article import Article
from app.models.category import Category
from app.models.user import User

articles_bp = Blueprint('articles', __name__)


def _resolve_current_user():
    identity = get_jwt_identity()
    if isinstance(identity, int):
        return db.session.get(User, identity)
    if isinstance(identity, str) and identity.isdigit():
        return db.session.get(User, int(identity))
    if isinstance(identity, str):
        return User.query.filter_by(email=identity).first()
    return None


def _slugify(value: str) -> str:
    base = (value or '').strip().lower()
    base = re.sub(r'[^a-z0-9\s-]', '', base)
    base = re.sub(r'[\s-]+', '-', base).strip('-')
    return base or 'article'

@articles_bp.route('/', methods=['GET'])
@jwt_required(optional=True)
def get_articles():
    """Get all articles"""
    current_user = _resolve_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    include_unpublished = request.args.get('include_unpublished', 'false').lower() == 'true'
    category_slug = request.args.get('category_slug')

    query = Article.query
    # Security check: only admins can see unpublished articles
    if not current_user or current_user.role != 'admin':
        query = query.filter_by(is_published=True)
    elif not include_unpublished:
        # Admins see published by default unless include_unpublished is True
        query = query.filter_by(is_published=True)
    if category_slug:
        query = query.join(Article.category_ref).filter_by(slug=category_slug)
    
    pagination = query.order_by(Article.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'articles': [article.to_dict() for article in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@articles_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all article categories"""
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({'categories': [category.to_dict() for category in categories]}), 200

@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Get a specific article"""
    article = db.session.get(Article, article_id)
    
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    article.views = (article.views or 0) + 1
    db.session.commit()
    
    return jsonify(article.to_dict()), 200


@articles_bp.route('/', methods=['POST'])
@jwt_required()
def create_article():
    """Create a new article (admin only)"""
    current_user = _resolve_current_user()
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    # Handle multipart/form-data
    data = request.form
    files = request.files

    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    category_id = data.get('category_id')

    if not title or not content or not category_id:
        return jsonify({'error': 'title, content, and category_id are required'}), 400

    category = db.session.get(Category, int(category_id)) if str(category_id).isdigit() else None
    if not category:
        return jsonify({'error': 'Invalid category_id'}), 400

    # Handle file upload
    thumbnail_url = None
    if 'thumbnail' in files:
        file = files['thumbnail']
        if file and file.filename:
            filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
            upload_path = current_app.config['UPLOAD_FOLDER']
            if not os.path.exists(upload_path):
                os.makedirs(upload_path, exist_ok=True)
            file.save(os.path.join(upload_path, filename))
            thumbnail_url = f"/api/articles/uploads/{filename}"

    provided_slug = (data.get('slug') or '').strip().lower()
    slug_base = provided_slug or _slugify(title)
    slug_candidate = slug_base
    index = 1
    while Article.query.filter_by(slug=slug_candidate).first():
        slug_candidate = f'{slug_base}-{index}'
        index += 1

    article = Article(
        category_id=category.id,
        title=title,
        slug=slug_candidate,
        summary=(data.get('summary') or '').strip() or None,
        content=content,
        thumbnail_url=thumbnail_url or (data.get('thumbnail_url') or '').strip() or None,
        author=(data.get('author') or current_user.full_name or 'Admin').strip(),
        is_published=data.get('is_published', 'true').lower() == 'true'
    )

    db.session.add(article)
    db.session.commit()

    return jsonify({
        'message': 'Article created successfully',
        'article': article.to_dict()
    }), 201


@articles_bp.route('/<int:article_id>', methods=['PUT'])
@jwt_required()
def update_article(article_id):
    """Update an existing article (admin only)"""
    current_user = _resolve_current_user()
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    article = db.session.get(Article, article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    data = request.form
    files = request.files

    if 'title' in data:
        article.title = data.get('title').strip()
    if 'content' in data:
        article.content = data.get('content').strip()
    if 'summary' in data:
        article.summary = data.get('summary').strip()
    if 'category_id' in data:
        category = db.session.get(Category, int(data.get('category_id')))
        if category:
            article.category_id = category.id
    if 'author' in data:
        article.author = data.get('author').strip()
    if 'is_published' in data:
        article.is_published = data.get('is_published', 'true').lower() == 'true'

    # Handle new thumbnail upload
    if 'thumbnail' in files:
        file = files['thumbnail']
        if file and file.filename:
            # Delete old thumbnail if it was a local file
            if article.thumbnail_url and article.thumbnail_url.startswith('/api/articles/uploads/'):
                old_filename = article.thumbnail_url.split('/')[-1]
                old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], old_filename)
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except:
                        pass
            
            filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
            upload_path = current_app.config['UPLOAD_FOLDER']
            if not os.path.exists(upload_path):
                os.makedirs(upload_path, exist_ok=True)
            file.save(os.path.join(upload_path, filename))
            article.thumbnail_url = f"/api/articles/uploads/{filename}"
    elif 'thumbnail_url' in data:
        article.thumbnail_url = data.get('thumbnail_url').strip()

    db.session.commit()

    return jsonify({
        'message': 'Article updated successfully',
        'article': article.to_dict()
    }), 200


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
@jwt_required()
def delete_article(article_id):
    """Delete an article (admin only)"""
    current_user = _resolve_current_user()
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    article = db.session.get(Article, article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    # Delete thumbnail if it was a local file
    if article.thumbnail_url and article.thumbnail_url.startswith('/api/articles/uploads/'):
        filename = article.thumbnail_url.split('/')[-1]
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass

    db.session.delete(article)
    db.session.commit()

    return jsonify({'message': 'Article deleted successfully'}), 200


@articles_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded thumbnails"""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
