import re
from sqlalchemy import and_

from app import db
from ext.core.exception import LogicException
from ..table.user import UserTable

# ?!?
import ext.budget.table


class UserModel(UserTable):

  @staticmethod
  def delete_by_id(id):
    '''
      - It deletes a user by his id.
    '''
    UserModel.query.filter(UserModel.id==id).delete()

  @staticmethod
  def load_by_id(user_id):
    '''
      - It loads a user by his id.
    '''
    return UserModel.query.filter(UserModel.id==user_id).first()

  @staticmethod
  def load_by_email(email):
    '''
      - It loads a user by the email.
    '''
    return UserModel.query.filter(UserModel.email==email).first()

  @staticmethod
  def register(email, password, name=''):
    '''
      - It registers a user into the system.
    '''
    if password.strip() == '':
      raise LogicException('The password is empty.')
    if not re.match('^[a-zA-Z0-9._]+\@[a-zA-Z0-9._]+\.[a-zA-Z]{2,3}$', email):
      raise LogicException('Wrong email format.')
    if not UserModel.is_free(email):
      raise LogicException('A such email is used.')
    user = UserModel(email, password)
    user.name = name
    db.session.add(user)
    db.session.commit()

    return user

  @staticmethod
  def is_free(email):
    '''
      - It checks if a user is registered with a such data in the system.
    '''
    user = UserModel.query.filter(
      UserModel.email==email
    ).first()
    return user is None

  @staticmethod
  def check_auth_by_pass(email, password):
    '''
      - It checks if a combination(email, password) is valid.
    '''
    user = UserModel.load_by_email(email)
    return (user != None) and (user.email == email) and (user.password == password)

  def update_profile(self, profile=dict()):
    '''
      - It tries to update user's profile correctly.
    '''
    if ('email' in profile and self.email != profile['email']) and not UserModel.is_free(profile['email']):
      raise LogicException('A such email is used.')

    if 'password' in profile and profile['password']=='':
      del(profile['password'])

    for key in profile:
      setattr(self, key, profile[key])
    db.session.add(self)
    db.session.commit()
