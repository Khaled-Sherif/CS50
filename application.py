import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify, json
from flask_session import Session
from tempfile import mkdtemp
from datetime import timedelta
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import *

# Configure application
app = Flask(__name__)
# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.before_request
def make_session_permanent():
    session.permanent = True
    app.secret_key = os.environ.get('super secret')
    #app.permanent_session_lifetime = timedelta(minutes=100000)

# Ensure responses aren't cached


@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


app.config["SESSION_TYPE"] = "filesystem"
Session(app)


if __name__ == '__main__':
    app.run(debug=True)

# Configure CS50 Library to use SQLite database
connection = sqlite3.connect("bookify.db", check_same_thread=False)
crsr = connection.cursor()
db = SQL("sqlite:///bookify.db")


@app.route("/", methods=["GET", "POST"])
def index():
    if not session.get('id'):
        if not session.get('temp_data'):
            initialize_visitor_data()
            print(f"\n\n\n\n{session['temp_data']}\n\n\n")

    if request.method == "POST":
        keywords = request.form.get("search_words")
        if not keywords:
            return render_template("index.html")
        else:
            return search()
    else:
        return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/my_books")
def my_books():
    if session.get('id') == True:
        favourites = db.execute("""SELECT * FROM favourites
                                JOIN items ON items.id = favourites.item_id
                                WHERE  user_id = ?""",
                                session['id'])

        view_history = db.execute("""SELECT * FROM items
                LEFT JOIN view_history ON items.id = view_history.item_id
                WHERE user_id = ?
                GROUP BY item_id
                ORDER BY view_history.id DESC LIMIT 20;""",
                                  session['id'])

        if request.args.get('filter_query'):
            query = json.loads(request.args.get('filter_query'))
        else:
            query = None

        items = {
            'favourites': favourites,
            'shelves': get_user_items(query),
            'view hisrory': view_history
        }

        filter_attributes = {
            'categories': arrange_attribute(get_user_items(query), 'category'),
            'languages': arrange_attribute(get_user_items(query), 'language'),
            'page counts': arrange_attribute(get_user_items(query), 'page_count'),
            'release date': [int(x[:4]) for x in arrange_attribute(get_user_items(query), 'release_date') if x[0].isdigit()]
        }

        return render_template("My collection.html", items=items, filter_attributes=filter_attributes)
    else:
        return 'None'


@app.route("/append_permession")
def append_permession():
    append_permession = request.args.get('order')
    if append_permession == 'y':
        session['temp_data'] = update_visitor_data()
        append_temp_to_usr_data(session["id"])
        session['temp_data']['collection'].clear()
        session['temp_data']['favourites'].clear()
        return 'append_successful'
    else:
        session['temp_data']['collection'].clear()
        session['temp_data']['favourites'].clear()
        return 'discard'


@app.route("/get_my_books_count")
def get_my_books_count():
    if session.get('id'):
        items = db.execute("""SELECT * FROM collection
                        LEFT OUTER JOIN favourites ON collection.item_id = favourites.item_id
                        WHERE collection.user_id = ?""", session['id'])
    else:
        session['temp_data'] = update_visitor_data()
        items = set(list(session['temp_data']['collection'].keys()) + session['temp_data']['favourites'])

    return str(len(items))


@app.route("/browse_history")
def browse_history():
    if session.get('id'):
        sql_query = f"""SELECT * FROM items
                    LEFT JOIN view_history ON items.id = view_history.item_id
                    WHERE user_id = {session['id']}
                    GROUP BY item_id
                    ORDER BY view_history.id DESC LIMIT 20;"""
    else:
        sql_query = f"""SELECT * FROM items
                    WHERE id IN ({(', '.join(update_visitor_data()['view_history']))})
                    GROUP BY id LIMIT 20;"""

    browse_history = []
    crsr.execute(sql_query)
    items = crsr.fetchall()
    columnNames = [column[0] for column in crsr.description]

    for record in items:
        browse_history.append(dict(zip(columnNames, record)))

    return {'Browse history': browse_history}


@app.route("/search", methods=["GET", "POST"])
def search():
    filters = {}
    if request.method == "POST":
        keywords = request.form.get("search_words")
        search_result = query_search(keywords)
        return render_template("search.html", results=search_result, page=1, keywords=keywords, str=str, post=True)
    else:
        filters = {
            'relevance': request.args.get("relevance"),
            'search_by': request.args.get("search-by"),
            'readability': request.args.get("read-availability"),
            'print_type': request.args.get("print_typ"),
            'lang': request.args.get("lang"),
            'keywords': request.args.get("keywords"),
            'page': request.args.get("page") if request.args.get("page") else 1
        }

        search_result = query_search(filters['keywords'], **filters)
        print(f"\n\n\n{filters}\n\n\n")
       # return render_template("search.html", results = search_result, page = filters['page'], keywords=filters['keywords'], str=str, post=True)
        return render_template("search.html", results=search_result, filters=filters, str=str, post=True)


@app.route("/view_item", methods=["GET", "POST"])
def view_item():
    item_id = request.args.get('volume_id')
    add_item(item_id)
    if session.get('id') == True:
        db.execute("INSERT INTO view_history (user_id, item_id) VALUES(?, ?)",
                   session['id'], item_id)
        return 'None'
    else:
        update_view_history(item_id)
        session['temp_data'] = update_visitor_data()
        return str(session['temp_data'])


@app.route("/get_user_items<query>")
def get_user_items(query):
    if query:
        query = json.loads(query)
    collection_items = {'To read': fill_shelf(1, query), 'Have read': fill_shelf(2, query), 'Reading': fill_shelf(3, query)}

    return collection_items


@app.route("/login", methods=["GET", "POST"])
def login():
    # Forget any user_id
    if session.get('id'):
        session.pop('id')
    user_email = request.form['user-email'].lower()
    password = request.form['user-password']
    rows = db.execute("SELECT * FROM users WHERE email = ?", user_email)
    if not user_email or not password:
        return 'Both fields are required'
    elif len(rows) == 0 or not check_password_hash(rows[0]["password"], password):
        return "Invalid Email or Password"
    else:
        session["id"] = rows[0]["id"]
        session["name"] = rows[0]["f_name"]
        if len(set(list(session['temp_data']['collection'].keys()) + session['temp_data']['favourites'])) > 0:
            return 'append_permession'
        return 'login_successful'


@app.route("/logout")
def logout():
    """Log user out"""
    # Forget any user_id
    session.pop('id')
    return redirect('/')


@app.route("/sign_up", methods=["POST"])
def sign_up():
    """Register user"""
    if request.method == "POST":
        form_inputs = {'first_name': None, 'last_name': None, 'email': None, 'b_date': None,
                       'gender': None, 'password': None, 're_password': None}

        form_inputs['first_name'] = request.form.get("first_name")
        form_inputs['last_name'] = request.form.get("last_name")
        form_inputs['email'] = request.form.get("email").lower()
        form_inputs['b_date'] = request.form.get("b_date")
        form_inputs['gender'] = request.form.get("gender")
        form_inputs['password'] = request.form.get("password")
        form_inputs['re_password'] = request.form.get("re_password")
        rows = db.execute("SELECT * FROM users WHERE email = ?", form_inputs['email'])

        for key, value in form_inputs.items():
            if value == None or not value:
                return form_inputs

        if form_inputs['password'] != form_inputs['re_password']:
            return ("Password and confirm Password don't match")
        elif len(rows) == 1:
            return("This Email is already registered")
        else:
            # try:
            db.execute("INSERT INTO users (f_name, l_name, b_date, gender, email, password) VALUES(?, ?, ?, ?, ?, ?)",
                       form_inputs['first_name'], form_inputs['last_name'], form_inputs['b_date'],
                       form_inputs['gender'], form_inputs['email'], generate_password_hash(form_inputs['password'], method='pbkdf2:sha256',
                                                                                           salt_length=8))

            return redirect("/")

    else:
        return render_template("register.html")


@app.route("/update_shelf")
def update_shelf():
    list_code = request.args.get('shelf')
    print(f'\n\n\n back shelf is {list_code}\n\n\n')
    item_id = request.args.get('volume_id')

    if session.get('id') == True:
        # check if item already exists in user collection
        row_collection = db.execute("SELECT * FROM collection WHERE user_id = ? AND item_id = ?",
                                    session['id'], item_id)

        # Add, delete or update item shelf based on list_code
        if len(row_collection) == 0:
            db.execute("INSERT INTO collection (user_id, item_id, list_id) VALUES(?, ?, ?)",
                       session['id'], item_id, list_code)
            return '1'
        elif row_collection[0]['list_id'] == int(list_code):
            db.execute("DELETE FROM collection WHERE item_id = ? AND user_id = ?", item_id, session['id'])
            return '0'

        else:
            db.execute("UPDATE collection SET list_id = ? WHERE item_id = ? AND user_id = ?",
                       list_code, item_id, session['id'])
            # return f"{row_collection[0]}"
            return "2"
    else:
        shelf = update_visitor_shelf(item_id, list_code)
        session['temp_data'] = update_visitor_data()
        return shelf


@app.route("/get_shelf")
def get_shelf():
    item_id = request.args.get('volume_id')

    if session.get('id') == True:
        user_id = session['id']

        item = db.execute("SELECT * FROM collection WHERE item_id = ? AND user_id = ?", item_id, user_id)

        if len(item) != 0:
            return str(item[0]['list_id'])
        else:
            return 'None'
    else:
        session['temp_data'] = update_visitor_data()
        if item_id in session['temp_data']['collection'].keys():
            return session['temp_data']['collection'][item_id]
        else:
            return 'None'


@app.route("/update_favourits")
def update_favourites():
    item_id = request.args.get('volume_id')

    if session.get('id') == True:
        # check for item in user favourites
        item = db.execute("SELECT * FROM favourits WHERE user_id = ? AND item_id = ?",
                          session['id'], item_id)
        # Add item to user favourites if it doesn't exist else remove it
        if len(item) == 0:
            db.execute("INSERT INTO favourits (user_id, item_id) VALUES(?, ?)",
                       session['id'], request.args.get('volume_id'))
            return '1'
        else:
            db.execute("DELETE FROM favourits WHERE item_id = ? AND user_id = ?",
                       request.args.get('volume_id'), session['id'])
            return '0'
    else:
        fav_bool = update_visitor_favourites(item_id)
        session['temp_data'] = update_visitor_data()
        print(f"\n\n\n{fav_bool}\n\n\n")
        return str(fav_bool)


@app.route("/check_if_fav")
def check_if_fav():
    item_id = request.args.get('volume_id')
    if session.get('id') == True:
        item = db.execute("SELECT * FROM favourites WHERE user_id = ? AND item_id = ?",
                          session['id'], item_id)
        # Add item to user favourites if it doesn't exist else remove it
        if len(item) == 0:
            return '0'
        else:
            return '1'
    else:
        if item_id in session['temp_data']['favourites']:
            print(f"\n\n\n{session['temp_data']['favourites']}\n\n\n")
            return '1'
        else:
            return '0'


@app.route("/return_chart_data")
def return_chart_data():
    item_id = request.args.get('item_id')

    item_shelves = {
        'To read': 0,
        'Have read': 0,
        'Reading': 0
    }

    data = db.execute("""SELECT list_id, COUNT(*) as counts FROM collection
            JOIN users ON users.id = collection.user_id
            WHERE item_id = ?
            GROUP BY list_id;""", item_id)

    for val in data:
        print(f"""\n\n{val}\n\n""")
        if val['list_id'] == 1:
            item_shelves['To read'] += int(val['counts'])
        elif val['list_id'] == 2:
            item_shelves['Have read'] += int(val['counts'])
        elif val['list_id'] == 3:
            item_shelves['Reading'] += int(val['counts'])

    return item_shelves