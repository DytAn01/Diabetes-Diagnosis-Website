from datetime import datetime
from app import db


class Article(db.Model):
    """Health article model"""
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    summary = db.Column(db.String(500))
    content = db.Column(db.Text, nullable=False)
    thumbnail_url = db.Column(db.String(500))
    author = db.Column(db.String(100), default='Admin')
    is_published = db.Column(db.Boolean, nullable=False, default=True, index=True)
    views = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        category_name = self.category_ref.name if self.category_ref else None
        return {
            'id': self.id,
            'category_id': self.category_id,
            'category': category_name,
            'title': self.title,
            'slug': self.slug,
            'summary': self.summary,
            'content': self.content,
            'thumbnail_url': self.thumbnail_url,
            'author': self.author,
            'is_published': self.is_published,
            'views': self.views,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'published_date': self.created_at.isoformat()
        }
