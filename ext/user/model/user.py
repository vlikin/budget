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
  def load_by_name(name):
    '''
      - It loads a user by his name.

      @test = false
    '''
    return UserModel.query.filter(UserModel.name==name).first()

  @staticmethod
  def load_by_name_password(name, password):
    '''
      - It loads a user by the name and by the password.

      @test = false
    '''
    return UserModel.query.filter(and_(UserModel.name==name, UserModel.password==password)).first()

  @staticmethod
  def register(email, password, name=''):
    '''
      - It registers a user into the system.
    '''
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
  def check_auth_by_pass(name, password):
    '''
      - It checks if a name password combination is valid.

      @test = false
    '''
    user = UserModel.load_by_name(name)
    return user.name == name and user.password == password

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
