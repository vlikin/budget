test_data = dict(
    users = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5', 'user_6'],
    user_objects = {},
    budgets = [
      dict(
        title = 'budget 1',
        budget_object = None,
        users = ['user_1', 'user_2', 'user_3'],
        tags = ['tag 1', 'tag 2', 'tag 3', 'tag 4'],
        tag_objects = dict(),
        contributions = [
          dict(
            user='user_1',
            amount='200'
          ),
          dict(
            user='user_2',
            amount='400'
          ),
          dict(
            user='user_3',
            amount='600'
          ),
          dict(
            user='user_1',
            amount='800'
          ),
        ],
        expenses = [
          dict(
            user='user_1',
            amount='80',
            tags = ['tag 1', 'tag 4'],
            description = 'user_1 income.'
          ),
          dict(
            user='user_2',
            amount='160',
            tags = ['tag 2', 'tag 3'],
            description = 'user_2 income.'
          ),
        ],
      ),
      dict(
        title = 'budget 2',
        budget_object = None,
        users = ['user_2', 'user_3', 'user_4'],
        tags = ['tag 1', 'tag 2', 'tag 3', 'tag 4'],
        tag_objects = dict(),
        contributions = [
          dict(
            user='user_2',
            amount='200'
          ),
          dict(
            user='user_2',
            amount='400'
          ),
          dict(
            user='user_3',
            amount='600'
          ),
          dict(
            user='user_4',
            amount='800'
          ),
        ],
        expenses = [
          dict(
            user='user_4',
            amount='90',
            tags = ['tag 1', 'tag 4'],
            description = 'user_4 expense.'
          ),
          dict(
            user='user_3',
            amount='110',
            tags = ['tag 2', 'tag 3'],
            description = 'user_4 expense.'
          ),
        ],
      )
    ]
  )