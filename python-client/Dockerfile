FROM python:3.4-alpine
WORKDIR /code
ADD app.py /code
ADD requirements.txt /code
ADD scripts /code/scripts
WORKDIR /code
RUN pip install -r requirements.txt
CMD ["python", "app.py"]