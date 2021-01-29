from flask import Flask, request, jsonify, send_from_directory
import os
import requests

app = Flask(__name__, static_url_path='')

MAGIC_START = '<script type="text/x-config">'

@app.route('/bfproxy', methods=['GET', 'POST'])
def bfproxy():
    param = request.form.get('url')
    if param is None:
        param = request.args.get('url')

    if param is not None and param.startswith('https://www.buzzfeed.com/'):
        # send http request
        r = requests.get(param)
        return jsonify({
            "code": r.status_code,
            "msg": r.text
        }), r.status_code
    else:
        if param is not None:
            print(param)
        return jsonify({
            "code": 999,
            "msg": "Bad request URL"
        }), 400

@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)

@app.route('/')
def hello():
    return app.send_static_file('index.html')

if __name__ == '__main__':
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port)
