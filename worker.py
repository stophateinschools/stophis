import os
from urllib.parse import urlparse

from dotenv import load_dotenv
from redis import Redis
from rq import Queue
from rq.worker import HerokuWorker as Worker

listen = ["high", "default", "low"]

redis_url = os.getenv("REDIS_URL")

load_dotenv()

if not redis_url:
    raise RuntimeError(
        "Set up Heroku Data For Redis first, \
    make sure its config var is named 'REDIS_URL'."
    )

url = urlparse(redis_url)
conn = Redis(
    host=url.hostname,
    port=url.port,
    password=url.password,
    ssl=(url.scheme == "rediss"),
    ssl_cert_reqs=None,
)


if __name__ == "__main__":
    from server import create_app

    app = create_app()
    with app.app_context():
        try:
            queues = [Queue(name, connection=conn) for name in listen]
            worker = Worker(queues)

            print("Starting RQ worker...")
            worker.work()
        except TimeoutError:
            print("Redis read timed out")
            raise RuntimeError("Redis read timed out")
        except ConnectionError:
            print("Could not connect to Redis")
            raise RuntimeError("Could not connec to Redis")
