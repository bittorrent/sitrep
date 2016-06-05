from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import Column, Integer, SmallInteger, String, Text


class Database(SQLAlchemy):
    def __init__(self, application):
        super(Database, self).__init__(application)
        db = self

        class ComponentUpdate(db.Model):
            id = db.Column(db.Integer, primary_key=True)
            component = db.Column(db.String(128))
            label = db.Column(db.String(128))
            status = db.Column(db.String(64))
            status_description = db.Column(db.Text())
            health = db.Column(db.SmallInteger())
            tags = db.Column(db.Text())
            time = db.Column(db.Integer())
            lifetime = db.Column(db.Integer())

        self.ComponentUpdate = ComponentUpdate
