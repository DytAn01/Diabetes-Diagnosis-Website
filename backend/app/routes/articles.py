from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import re
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
def get_articles():
    """Get all articles"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    include_unpublished = request.args.get('include_unpublished', 'false').lower() == 'true'
    category_slug = request.args.get('category_slug')

    query = Article.query
    if not include_unpublished:
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
    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    content = (data.get('content') or '').strip()
    category_id = data.get('category_id')

    if not title or not content or not category_id:
        return jsonify({'error': 'title, content, and category_id are required'}), 400

    category = db.session.get(Category, int(category_id)) if str(category_id).isdigit() else None
    if not category:
        return jsonify({'error': 'Invalid category_id'}), 400

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
        thumbnail_url=(data.get('thumbnail_url') or '').strip() or None,
        author=(data.get('author') or current_user.full_name or 'Admin').strip(),
        is_published=bool(data.get('is_published', True))
    )

    db.session.add(article)
    db.session.commit()

    return jsonify({
        'message': 'Article created successfully',
        'article': article.to_dict()
    }), 201
