import os
from urllib.parse import urlparse

from redis import Redis
from rq import Queue
from rq.worker import HerokuWorker as Worker

listen = ['high', 'default', 'low']

redis_url = os.getenv('REDIS_URL')

if not redis_url:
    raise RuntimeError("Set up Heroku Data For Redis first, \
    make sure its config var is named 'REDIS_URL'.")

url = urlparse(os.environ.get("REDIS_URL"))
conn = Redis(host=url.hostname, port=url.port, password=url.password, ssl=(url.scheme == "rediss"), ssl_cert_reqs=None)


if __name__ == '__main__':
    from server import create_app
    app = create_app()
    with app.app_context():
      queues = [Queue(name, connection=conn) for name in listen]
      worker = Worker(queues)

      print("Starting RQ worker...")
      worker.work()