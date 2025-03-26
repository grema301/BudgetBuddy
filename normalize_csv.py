import csv
import re


def clean_name(name):
    """Removes unwanted words or suffixes from product names."""
    name = re.sub(r'(null|undefined|\d+kg|\d+g|each|per kg|per unit|block|punnet|bottle|carton|\d+pack)\.?$', '', name, flags=re.IGNORECASE)  # Remove trailing unwanted words
    name = re.sub(r'(\d+ml|\d+L)\.?$', '', name, flags=re.IGNORECASE)  # Remove trailing '500ml', '1L', etc.
    return name.strip()


def clean_price(price):
    """Ensures price is in x.xx format by fixing multiple decimal points and removing non-numeric characters."""
    price = re.sub(r'[^\d.]', '', price)  # Keep only numbers and dots
    price_matches = re.findall(r'\d+\.\d{2}', price)  # Find valid price patterns

    if price_matches:
        return price_matches[0]  # Use first valid price (correct x.xx format)
    
    # If no valid price found, attempt to fix it
    digits_only = re.sub(r'\D', '', price)  # Remove non-numeric characters
    if digits_only:
        return f"{int(digits_only) / 100:.2f}"  # Convert integer to decimal format
    
    return "0.00"  # Default if no valid number found


def normalize_csv(input_file, output_file):
    """Reads a CSV file, normalizes names and prices, and writes to a new file with links included."""
    with open(input_file, mode='r', encoding='utf-8') as infile:
        reader = csv.reader(infile)

        try:
            headers = next(reader)  # Read headers
        except StopIteration:
            print(f"Error: {input_file} is empty.")
            return

        normalized_rows = []

        for row in reader:
            if len(row) < 4:  # Ensure we have Name, Price, Image, and Link
                continue  # Skip malformed rows

            name, price, image, link = row
            name = clean_name(name)
            price = clean_price(price)

            if name and price:
                normalized_rows.append([name, price, image, link])  # Keep all four columns

    if normalized_rows:
        with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            writer.writerow(["Name", "Price", "Image URL", "Website Link"])  # Updated headers
            writer.writerows(normalized_rows)
        print(f"Normalization complete. Data saved to {output_file}")
    else:
        print("No valid data to write after normalization.")


# Example usage (Ensures all supermarket CSVs are processed)
normalize_csv("newworld_products.csv", "newworld_products.csv")
normalize_csv("paknsave_products.csv", "paknsave_products.csv")
normalize_csv("woolworths_products.csv", "woolworths_products.csv")
