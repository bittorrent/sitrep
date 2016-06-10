from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import Column, Float, Integer, SmallInteger, String, Text


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
            time = db.Column(db.Float(precision=53))
            lifetime = db.Column(db.Float(precision=53))

            def roll_up(self, other):
                for attribute in ['component', 'label', 'status', 'status_description', 'health', 'tags']:
                    if getattr(self, attribute) != getattr(other, attribute):
                        return False

                first = self if self.id < other.id else other
                second = other if self.id < other.id else self

                if first.time + first.lifetime < second.time:
                    return False

                self.lifetime = second.time + second.lifetime - first.time
                self.time = first.time
                return True

        self.ComponentUpdate = ComponentUpdate
