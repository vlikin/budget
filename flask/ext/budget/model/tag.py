from app import db
from ..table.tag import TagTable

class TagModel(TagTable):

  @staticmethod
  def delete_by_id(id):
    '''
      - It deletes a user by his id.
    '''
    TagModel.query.filter(TagModel.id==id).delete()

  @staticmethod
  def load_by_id(user_id):
    '''
      - It loads a user by his id.
    '''
    return TagModel.query.filter(TagModel.id==user_id).first()

  @staticmethod
  def create(title, budget_id, parent_id=None):
    '''
      - It registers a user into the system.
    '''
    tag = TagModel(title, budget_id, parent_id)
    db.session.add(tag)
    db.session.commit()
    return tag