import csv
import pandas as pd
import json
from fuzzywuzzy import process

def merge_csvs(csv1, csv2, csv3, output_csv, output_json):
    df1 = pd.read_csv(csv1)
    df2 = pd.read_csv(csv2)
    df3 = pd.read_csv(csv3)
    
    # Standardize column names
    df1.columns = ["Name", "Price_1", "Image_URL_1", "Website_Link_1"]
    df2.columns = ["Name", "Price_2", "Image_URL_2", "Website_Link_2"]
    df3.columns = ["Name", "Price_3", "Image_URL_3", "Website_Link_3"]
    
    # Helper function to match product names
    def match_names(name, choices):
        match, score = process.extractOne(name, choices)
        return match if score > 85 else None  # Only match if similarity > 85%
    
    # Merge datasets based on best name match
    merged_data = []
    for name in df1["Name"]:
        match2 = match_names(name, df2["Name"].tolist())
        match3 = match_names(name, df3["Name"].tolist())
        
        if match2 and match3:
            price_1 = df1.loc[df1["Name"] == name, "Price_1"].values[0]
            price_2 = df2.loc[df2["Name"] == match2, "Price_2"].values[0]
            price_3 = df3.loc[df3["Name"] == match3, "Price_3"].values[0]
            
            # Pick an image from the available sources
            image_url = df1.loc[df1["Name"] == name, "Image_URL_1"].values[0]
            if pd.isna(image_url):
                image_url = df2.loc[df2["Name"] == match2, "Image_URL_2"].values[0]
            if pd.isna(image_url):
                image_url = df3.loc[df3["Name"] == match3, "Image_URL_3"].values[0]
            
            # Track website links for each item
            link_1 = df1.loc[df1["Name"] == name, "Website_Link_1"].values[0]
            link_2 = df2.loc[df2["Name"] == match2, "Website_Link_2"].values[0]
            link_3 = df3.loc[df3["Name"] == match3, "Website_Link_3"].values[0]
            
            merged_data.append({
                "name": name,
                "prices": {
                    "New World": {"price": price_1, "link": link_1},
                    "Pak'nSave": {"price": price_2, "link": link_2},
                    "Woolworths": {"price": price_3, "link": link_3}
                },
                "image_url": image_url
            })
    
    # Create final DataFrame and save CSV
    merged_df = pd.DataFrame(merged_data)
    merged_df.to_csv(output_csv, index=False)
    print(f"Merged CSV saved to {output_csv}")
    
    # Save JSON file
    with open(output_json, "w") as json_file:
        json.dump(merged_data, json_file, indent=4)
    print(f"Merged JSON saved to {output_json}")

if __name__ == "__main__":
    merge_csvs("newworld_products.csv", "paknsave_products.csv", "woolworths_products.csv", "merged_supermarket_data.csv", "merged_supermarket_data.json")
