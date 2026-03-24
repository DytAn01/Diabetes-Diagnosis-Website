#!/usr/bin/env python
"""Seed the database with sample articles and categories"""

from app import create_app, db
from app.models.category import Category
from app.models.article import Article

app = create_app()
app.app_context().push()

# Create categories
categories = [
    {"name": "Diabetes Basics", "slug": "diabetes-basics", "description": "Fundamental information about diabetes"},
    {"name": "Diet & Nutrition", "slug": "diet-nutrition", "description": "Nutritional guidance for diabetes management"},
    {"name": "Exercise", "slug": "exercise", "description": "Physical activity recommendations"},
    {"name": "Prevention", "slug": "prevention", "description": "How to prevent diabetes"}
]

for cat_data in categories:
    if not Category.query.filter_by(slug=cat_data['slug']).first():
        category = Category(**cat_data)
        db.session.add(category)

db.session.commit()

# Create sample articles
articles_data = [
    {
        "category_id": 1,
        "title": "Understanding Diabetes Type 2",
        "slug": "understanding-diabetes-type-2",
        "summary": "Learn the basics of Type 2 diabetes and how it affects your body",
        "content": "Type 2 diabetes is a condition where the body cannot properly use insulin. This comprehensive guide covers the causes, symptoms, and management strategies for Type 2 diabetes.",
        "thumbnail_url": "https://via.placeholder.com/400x300?text=Diabetes",
        "author": "Health Expert",
        "is_published": True
    },
    {
        "category_id": 2,
        "title": "Healthy Foods for Diabetics",
        "slug": "healthy-foods-for-diabetics",
        "summary": "Discover nutritious foods that help manage blood sugar levels",
        "content": "Eating the right foods is crucial for diabetes management. This article covers low glycemic index foods, portion control, and meal planning tips for people with diabetes.",
        "thumbnail_url": "https://via.placeholder.com/400x300?text=Nutrition",
        "author": "Nutritionist",
        "is_published": True
    },
    {
        "category_id": 3,
        "title": "Exercise and Diabetes",
        "slug": "exercise-and-diabetes",
        "summary": "How regular exercise helps control diabetes",
        "content": "Physical activity is one of the most effective ways to manage diabetes. Learn about different types of exercises and how to create a sustainable fitness routine.",
        "thumbnail_url": "https://via.placeholder.com/400x300?text=Exercise",
        "author": "Fitness Coach",
        "is_published": True
    }
]

for article_data in articles_data:
    if not Article.query.filter_by(slug=article_data['slug']).first():
        article = Article(**article_data)
        db.session.add(article)

db.session.commit()

total_categories = len(db.session.query(Category).all())
total_articles = len(db.session.query(Article).all())

print(f"[OK] Created {total_categories} categories")
print(f"[OK] Created {total_articles} articles")
print("[OK] Database seeded successfully!")
