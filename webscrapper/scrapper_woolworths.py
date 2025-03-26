from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import csv
from selenium.webdriver.chrome.options import Options

def scrape_page(driver, page_number):
    url = f"https://www.woolworths.co.nz/shop/searchproducts?search=%25%20%25&page={page_number}&inStockProductsOnly=false"
    driver.get(url)
    
    try:
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CLASS_NAME, "contentContainer-main")))
    except:
        print(f"Failed to load page {page_number}")
        return []
    
    product_list = []
    items = driver.find_elements(By.CLASS_NAME, "cdx-card-cup-adjustment")
    
    for item in items:
        try:
            name = item.find_element(By.TAG_NAME, "h3").get_attribute("aria-label").strip()
        except:
            name = "N/A"
        
        try:
            price_element = item.find_elements(By.TAG_NAME, "h3")[1]
            price = price_element.get_attribute("aria-label").strip()
        except:
            price = "N/A"
        
        try:
            image = item.find_element(By.TAG_NAME, "img").get_attribute("src")
        except:
            image = "N/A"
                
        try:
            href = item.find_element(By.XPATH, ".//a").get_attribute("href")
        except:
            href = "N/A"
        
        product_list.append([name, price, image, href])
    
    return product_list

def scrape_supermarket():
    filename = "woolworths_products.csv"
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Name", "Price", "Image URL", "Website Link"])
        
        for page in range(1, 21):
            print(f"Scraping page {page}...")
            products = scrape_page(driver, page)
            writer.writerows(products)
            
    driver.quit()
    print(f"Scraping complete. Data saved to {filename}")

if __name__ == "__main__":
    scrape_supermarket()
