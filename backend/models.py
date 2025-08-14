from db import db

class Country(db.Model):
    __tablename__ = 'countries'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    flag = db.Column(db.LargeBinary, nullable=True) 
    
    metrics = db.relationship(
        'Metric',
        secondary='country_metrics',
        backref=db.backref('countries', lazy='dynamic'),
        lazy='dynamic'
    )

class MetricGroup(db.Model):
    __tablename__ = 'metric_groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    metrics = db.relationship('Metric', backref='group', lazy='dynamic')

class Metric(db.Model):
    __tablename__ = 'metrics'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    group_id = db.Column(db.Integer, db.ForeignKey('metric_groups.id'), nullable=False)
    is_positive = db.Column(db.Boolean, nullable=False, default=True)
    unit = db.Column(db.String(50), nullable=True)

country_metrics = db.Table('country_metrics',
    db.Column('country_id', db.Integer, db.ForeignKey('countries.id'), primary_key=True),
    db.Column('metric_id', db.Integer, db.ForeignKey('metrics.id'), primary_key=True),
    db.Column('raw_value', db.Float, nullable=False)
)

class CountryIndustry(db.Model):
    __tablename__ = 'country_industries'
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(100), nullable=False, unique=True)
    dominant_industries = db.Column(db.ARRAY(db.String), nullable=False)
    growing_industries = db.Column(db.ARRAY(db.String), nullable=False)
    comments = db.Column(db.Text)

    def to_dict(self):
        return {
            "country": self.country,
            "top_dominant_sectors": self.dominant_industries,
            "top_growing_sectors": self.growing_industries,
            "comments": self.comments
        }

from db import db
from sqlalchemy.dialects.postgresql import ARRAY

class CountryDisciplines(db.Model):
    __tablename__ = 'country_disciplines'
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(100), nullable=False, unique=True)
    top_disciplines = db.Column(ARRAY(db.String), nullable=False) 
    comments = db.Column(db.Text)

    def to_dict(self):
        return {
            "country": self.country,
            "top_disciplines": self.top_disciplines,
            "comments": self.comments
        }