test_data = dict(
    users = ['user 1', 'user 2', 'user3'],
    user_objects = {},
    budgets = [
      dict(
        title = 'budget 1',
        budget_object = None,
        users = ['user 1', 'user 2', 'user 3'],
        tags = ['tag 1', 'tag 2', 'tag 3', 'tag 4'],
        tag_objects = dict(),
        contribution = [
          dict(
            user='user 1',
            amount='200'
          ),
          dict(
            user='user 2',
            amount='400'
          ),
          dict(
            user='user 3',
            amount='600'
          ),
          dict(
            user='user 1',
            amount='800'
          ),
        ],
        expense = [
          dict(
            user='user 1',
            amount='80',
            tags = ['tag 1', 'tag 4']
          ),
          dict(
            user='user 2',
            amount='160',
            tags = ['tag 2', 'tag 3']
          ),
        ],
      )
    ]
  )