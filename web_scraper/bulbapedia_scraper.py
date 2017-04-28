import requests
from bs4 import BeautifulSoup
import urllib
import json

def getImage(pokemon, number):
    if number < 10:
        number = '00' + str(number)
    elif number < 100:
        number = '0' + str(number)
    print(pokemon)
    print(number)
    page = requests.get('http://bulbapedia.bulbagarden.net/wiki/File:' + number + pokemon + '.png')
    soup = BeautifulSoup(page.content, 'html.parser')
    image_div = soup.find_all('div', class_='fullImageLink')[0]
    image_link = image_div.find('a').get('href')
    urllib.urlretrieve(image_link, str(number) + pokemon + ".png")

# Grabs images up until the specified pokedex number
def pullImages(pokedex_num):
    with open('en_pokemon.json') as pokemons:    
        data = json.load(pokemons)  
    for i in range(pokedex_num):
        getImage(data[i], i+1)

if __name__ == "__main__":
    pullImages(20)
    