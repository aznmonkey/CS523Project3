import requests
from bs4 import BeautifulSoup
import urllib
import json

def getImage(pokemon, url, number):
    page = requests.get('http://bulbapedia.bulbagarden.net'+url)
    soup = BeautifulSoup(page.content, 'html.parser')
    image_div = soup.find_all('div', class_='fullImageLink')[0]
    image_link = image_div.find('a').get('href')
    urllib.urlretrieve(image_link, "Gen2/"+pokemon + number + ".png")

def findImageURL(pokemon, number_of_images):
    print(pokemon)
    page = requests.get('http://archives.bulbagarden.net/wiki/Category:'+pokemon)
    soup = BeautifulSoup(page.content, 'html.parser')
    image_ul = soup.find_all('ul', class_='gallery mw-gallery-traditional')[0]
    image_divs = image_ul.find_all('div', class_='thumb')
    if number_of_images == 'all':
        for i in range(len(image_divs)):
            image_link = image_divs[i].find('a').get('href')
            getImage(pokemon, str(image_link), str(i))
    else:
        for i in range(number_of_images):
            image_link = image_divs[i].find('a').get('href')
            print str(i) + " of " + str(number_of_images)
            getImage(pokemon, str(image_link), str(i))

# Grabs images up until the specified pokedex number, specify all if you want to get all images
# otherwise specify the number
def pullImages(pokedex_num, images_per_pokemon):
    with open('en_pokemon.json') as pokemons:    
        data = json.load(pokemons)  
    for i in range(pokedex_num):
        if i > 150:
            findImageURL(data[i], images_per_pokemon)

if __name__ == "__main__":
    pullImages(252, 15)
    