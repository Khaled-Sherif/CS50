import os
import requests
import re
import sqlite3
import urllib.parse
from flask import redirect, render_template, request, session, flash
from functools import wraps
from cs50 import SQL

connection = sqlite3.connect("bookify.db", check_same_thread=False)
crsr = connection.cursor()
db = SQL("sqlite:///bookify.db")

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def query_search(book_name, **kwargs):
    """search for books."""

    # Contact API
    try:
        api_key = os.environ.get("AIzaSyDueGFa3RO1yIF7MNEuck-FR3bLDdjGaEs")
        if kwargs:
            
            startIndex = str((int(kwargs['page'])-1) * 30)
            url = f"https://www.googleapis.com/books/v1/volumes?q={kwargs['keywords']}+{kwargs['search_by']}:keyes&read-availability={kwargs['readability']}&maxResults=30&startIndex={startIndex}&orderBy={kwargs['relevance']}&printType={kwargs['print_type']}&langRestrict={kwargs['lang']}&key=AIzaSyDueGFa3RO1yIF7MNEuck-FR3bLDdjGaEs"
        else:
            url = f"https://www.googleapis.com/books/v1/volumes?q={book_name}&startIndex=0&maxResults=30&key=AIzaSyDueGFa3RO1yIF7MNEuck-FR3bLDdjGaEs"
            
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException:
        return None
    # Parse response
    try:
        result = response.json()['items']
        
        return result

    except (KeyError, TypeError, ValueError):
        return None

def add_item(volume_id):
    #check if item exists in items
    item = db.execute("SELECT * FROM items WHERE id = ?", volume_id)
    if len(item) == 1:
        pass
    else:
        new_item = create_item(volume_info(volume_id))
        db.execute("INSERT INTO items (id, title, category, language, rating, rating_count, description, buy_url, image_url, author, release_date, print_type, publisher, page_count) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            new_item['id'], new_item['title'], ('/'.join(new_item['categories'])), new_item['language'], new_item['averageRating'], new_item['ratingsCount'], new_item['description'],
            new_item['buyLink'], new_item['imageLinks']['thumbnail'], ('/'.join(new_item['authors'])), new_item['publishedDate'], new_item['printType'], new_item['publisher'], new_item['pageCount'])
    print(f"\n\n\n\n {session['temp_data']} \n\n\n")


def generate_condition(query, key):

    if len(query[key]) == 0:
        statment = ''
    else: 
        statment = f"""AND ({' OR '.join(f"{key} LIKE '%{i.lower().strip()}%'" for i in query[f"{key}"])})\n"""

    return statment


def create_chart_data(item_id, attr):
    if attr == 'age' :
        sql_query = (
            "SELECT cast(strftime('%Y.%m%d', 'now') - strftime('%Y.%m%d', b_date) as int) as Age\n"
            ",COUNT(list_id) FROM users\n"
            "JOIN collection ON users.id = collection.user_id\n"
            f"WHERE item_id='{item_id}'\n"
            "GROUP BY list_id;"
        )
    else:
        sql_query = (
            "SELECT  gender, list_id, COUNT(*) FROM collection"
            "JOIN users ON users.id = collection.user_id"
            f"WHERE item_id='{item_id}'"
            "GROUP BY gender, list_id;"
        )
        
    data = db.execute(sql_query)
    
    return data
    

def fill_shelf(shelf_code, query):
    user_id = session['id']
    if query != None:
        sql_query = (
            "SELECT * FROM collection\n"
            "JOIN items ON items.id = collection.item_id\n"
            "WHERE\n"
            f"user_id = {user_id} AND list_id = {shelf_code}\n"
            f"AND (title LIKE '%{query['keywords']}%' OR description LIKE '%{query['keywords']}%')\n"
            f"{generate_condition(query, 'category')}"
            f"{generate_condition(query, 'language')}"
            f"AND substr(release_date,0,5) BETWEEN '{query['release_date']['year_from']}' AND '{query['release_date']['year_to']}'\n"
            f"AND page_count <= {query['page_count']}"
        )
    else:
        sql_query = f"SELECT * FROM collection JOIN items ON items.id = collection.item_id WHERE  user_id = {user_id}  AND list_id = {shelf_code}"
    crsr.execute(sql_query)
    items = crsr.fetchall()
    insertObject = []
    #db.execute("""
    #SELECT * FROM collection JOIN items ON items.id = collection.item_id WHERE  user_id = ?  AND list_id = ?""", user_id, shelf_code)
    columnNames = [column[0] for column in crsr.description]
    for record in items:
        insertObject.append( dict( zip( columnNames , record ) ) )
    return insertObject

def arrange_attribute(items, attribute_name):
    attribute_list = []
    for lst in items.values():
        for book in lst:
            list_elements = [x for x in str(book[attribute_name]).split('/') if x != 0]
            attribute_list += list_elements


    return sorted(set(attribute_list))


def volume_info(volume_id):
    url = f"https://www.googleapis.com/books/v1/volumes/{volume_id}"
    try:
        response = requests.get(url)
        return response.json()
  
    except requests.RequestException:
        
        return None


def create_item(volume):
    volume_id = volume['id']
    try:
        buy_url = volume['saleInfo']['buyLink']
    except:
        buy_url = 'N/A'

    volume_info = volume['volumeInfo']

    new_item = {'id': volume_id, "title": 'N/A', "categories": 'N/A', 'language': 'N/A', 
            'averageRating': 0, 'ratingsCount': 0, 'description': 'N/A', 'buyLink': buy_url,
            'imageLinks': None, 'authors': 'N/A', 'publishedDate': 'N/A', 'printType': None, 
            'publisher': 'N/A', 'pageCount': None}

    for key in new_item.keys():
        if key in volume_info.keys():
            new_item[key] = volume_info[key]
        else:
            pass

    return new_item

def initialize_visitor_data():
    if not session.get('temp_data') == True:
        session['temp_data'] = {
                    'view_history': [],
                    'favourites': [],
                    'collection': {}
                    }
    else:
        pass

def update_view_history(item_id):
    try:
        if session['temp_data']['view_history'][-1] == item_id:
            pass
        else:
            session['temp_data']['view_history'].append(f"'{item_id}'")
    except IndexError:
        session['temp_data']['view_history'].append(f"'{item_id}'")

def update_visitor_shelf(item_id, list_code):
    if item_id in session['temp_data']['collection'].keys():
        if session['temp_data']['collection'][item_id] == list_code:
            del session['temp_data']['collection'][item_id]
            return '0'
        else:
            session['temp_data']['collection'][item_id] = list_code
            return str(list_code)
    else:
        session['temp_data']['collection'][item_id] = list_code
        return str(list_code)

def update_visitor_favourites(item_id):
    if item_id in session['temp_data']['favourites']:
        session['temp_data']['favourites'].remove(item_id)
        return '0'
    else:
        session['temp_data']['favourites'].append(item_id)
        return '1'


def append_temp_to_usr_data(user_id):
    for key, value in session['temp_data'].items():
        if type(session['temp_data'][key]) == dict:
            for id, value in session['temp_data'][key].items():
                db.execute(f"INSERT INTO {key} (user_id, item_id, list_id) VALUES(?, ?, ?)", 
                user_id, id, value)
        else:
            pass
            #for id in value:
            #    print(f"\n\n\n{user_id, id}\n\n\n")
            #    db.execute(f"INSERT INTO {key} (user_id, item_id) VALUES(?, ?)", 
            #    user_id, id)
                

def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

def list_to_dict(items_lst):
    new_dict = {}
    for item in items_lst:
        new_dict[item['item_id']] = item
    return new_dict

def update_visitor_data():
    return session['temp_data']