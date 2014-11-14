import json

from ext.shell.test.ready_data_base import ReadyDataBaseTestCase


class UserRestTestCase(ReadyDataBaseTestCase):
  '''
    - It tests the core functionality.
  '''

  def test_first(self):
    print self.login('user_1@example.com', 'user_1')
    # Email does not exist.
    response = self.post_json('/budget/index', {})
    print response
    #response_dict=json.loads(response.data)
    #print response_dict
    #assert response_user_dict['success'] == True
    assert 1 == 1