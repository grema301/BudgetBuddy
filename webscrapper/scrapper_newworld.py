from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import csv
import time
import random
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

def clear_browser_data(driver):
    driver.get("chrome://settings/clearBrowserData")
    time.sleep(2)  # Wait for settings page to load

    actions = ActionChains(driver)
    actions.send_keys(Keys.TAB * 7)  # Navigate to the "Clear data" button
    actions.send_keys(Keys.ENTER)  # Press "Enter" to clear cache & cookies
    actions.perform()

    time.sleep(5)  # Wait for data to be cleared

def scrape_page(driver, page_number):
    clear_browser_data(driver)  # Clear cookies & cache before loading page
    
    url = f"https://www.newworld.co.nz/shop/search?pg={page_number}"
    driver.get(url)
    
    input(f"Please complete the Cloudflare verification for page {page_number}, then press Enter...")
    
    try:
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CLASS_NAME, "_1ubi26e0")))
    except:
        print(f"Failed to load page {page_number}")
        return []
    
    product_list = []
    items = driver.find_elements(By.CLASS_NAME, "_1afq4wy0")
    
    for item in items:
        try:
            name = item.find_element(By.XPATH, ".//*[@data-testid='product-title']").text.strip()
        except:
            name = "N/A"
        
        try:
            image = item.find_element(By.XPATH, ".//*[@data-testid='product-image']").get_attribute("src")
        except:
            image = "N/A"
        
        try:
            dollars = item.find_element(By.XPATH, ".//*[@data-testid='price-dollars']").text.strip()
            cents = item.find_element(By.XPATH, ".//*[@data-testid='price-cents']").text.strip()
            price = f"{dollars}.{cents}"
        except:
            price = "N/A"
        
        product_list.append([name, price, image])
    
    return product_list

def scrape_supermarket():
    filename = "supermarket_products.csv"
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Name", "Price", "Image URL"])
        
        for page in range(1, 21):
            print(f"Scraping page {page}...")
            products = scrape_page(driver, page)
            writer.writerows(products)
            
            sleep_time = 1 # Randomized delay to avoid detection
            print(f"Waiting {sleep_time:.2f} seconds before next page...")
            time.sleep(sleep_time)
            
    driver.quit()
    print(f"Scraping complete. Data saved to {filename}")

if __name__ == "__main__":
    scrape_supermarket()
