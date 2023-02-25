# Bookify
#### Video Demo:  https://youtu.be/sOAKjop9g_8
#### Description:
Bookify is a web application based on restful API that helps the application perform full-text searches and retrieve book information,
viewability, and more information about the book.

This Application is a final project for the CS50 course, that demonstrates the understandability of the techniques and material offered in this course.


About Google Books API:

The web application is supposed to serve mainly as an advanced search engine that can submit full-text searches for books, retrieve and display book information like authour, ratings...etc. beside adding Books to library collections.
Submit authenticated requests to create and modify library collections, ratings, labels, and more.

More Info about Google Books Api can be found [here](https://developers.google.com/books/docs/overview)


#### Files included:
`application.py` : Main App controller, contains all web app routes.<br>
`helpers.py` : Contains all helper functions needed to perform backend operations.<br>
`layout.html`: Is the main structure of the templates and contains all extend templates as well as all the important links.<br>
`index.html`: Home page template<br>
`search.html`: Search result page template<br>
`My collection.html`: Users collection template<br>
`about.html`: Web app information template<br>
<br><br>


## What users an do:<br>
- Search for a book.
- Filter search results based on 5 attributes
- View book information.
- Add/remove book in his collection.
- Update his library shelf.
- Add a book as a favourite.
- Login/Sign up.
- View his books library.
- Filter books in his library based on 6 attributes
- Sort shelfs slider based on user selection.
- View insights about a book (How many times it was added to a certatin shelf)

## Web Appliaction functionalities:<br>
- Search for a book.

![Search](https://user-images.githubusercontent.com/66789935/219908766-69cf7ce9-8872-49cf-8078-9b1f38fd17d5.PNG)

- Filter search results based on 5 attributes.

![filter_result](https://user-images.githubusercontent.com/66789935/219908784-44974109-a864-4486-b8f9-b5e9630f6e6b.png)

- View book Information like desribtion, autor, category....etc. and the ability to add the books to my books by selecting the book as a favourite or adding it to a shelf

![view_item](https://user-images.githubusercontent.com/66789935/219908910-1bd51463-91e1-4d3c-9b81-c60ef87d11af.PNG)

- Login/Sign up.

![sign_in_up](https://user-images.githubusercontent.com/66789935/219908975-b58e621a-079f-4188-95d5-3e4875147b89.PNG)

- View my books library and filter books in my books library based on 6 attributes and sort each shelf based on 3 attributes.

![View_my_books](https://user-images.githubusercontent.com/66789935/219909010-0066a1d3-fcfd-45cd-9b29-a0a3702af650.PNG)

- View Book shelf insights on Bookify based on all users data.

![insights](https://user-images.githubusercontent.com/66789935/219909026-99a25cdc-5ec1-4e63-9836-ccda2ecaadfd.PNG)



#### Code written in:
- Python
- Javascript
- HTML
- SQL

## Used Frameworks/Enviroments:
- Flask
- SQLite
- Jquery
- Jinja2
- Google Cloud (Google Books API)


## requirments
- cs50
- Flask
- Flask-Session
- requests
- os
- werkzeug
- sqlite
- functools


## Installation

### Installation
By following these instructions you can run this application on your local machine.

Use `pip install -r requirements.txt` to install, or run the folloing commands:
>pip install flask

>pip install flask_session

>pip install requests

>pip install os

>pip install werkzeug

>pip install sqlite

>pip install functools



