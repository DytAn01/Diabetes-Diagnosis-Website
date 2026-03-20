from flask import Blueprint, request, jsonify
from app import db
from app.models.article import Article

articles_bp = Blueprint('articles', __name__)

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

@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Get a specific article"""
    article = db.session.get(Article, article_id)
    
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    article.views = (article.views or 0) + 1
    db.session.commit()
    
    return jsonify(article.to_dict()), 200
