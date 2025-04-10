import pandas as pd
import json
from fuzzywuzzy import process
import os

def merge_csvs(csv1, csv2, csv3, output_csv, output_json):
    df1 = pd.read_csv(csv1)
    df2 = pd.read_csv(csv2)
    df3 = pd.read_csv(csv3)

    # Standardize column names
    df1.columns = ["Name", "Price_1", "Image_URL_1", "Website_Link_1"]
    df2.columns = ["Name", "Price_2", "Image_URL_2", "Website_Link_2"]
    df3.columns = ["Name", "Price_3", "Image_URL_3", "Website_Link_3"]

    # Drop duplicates to reduce redundancy
    df1 = df1.drop_duplicates(subset=["Name"])
    df2 = df2.drop_duplicates(subset=["Name"])
    df3 = df3.drop_duplicates(subset=["Name"])

    # Helper function to match product names
    def match_names(name, choices):
        match, score = process.extractOne(name, choices)
        return match if score > 85 else None

    merged_data = []
    seen_names = set()  # Track merged products to avoid duplicates

    for name in df1["Name"]:
        if name in seen_names:
            continue

        match2 = match_names(name, df2["Name"].tolist())
        match3 = match_names(name, df3["Name"].tolist())

        # Only merge if both matches are valid
        if match2 and match3:
            price_1 = df1.loc[df1["Name"] == name, "Price_1"]
            price_2 = df2.loc[df2["Name"] == match2, "Price_2"]
            price_3 = df3.loc[df3["Name"] == match3, "Price_3"]

            # Skip if any of the prices are missing
            if price_1.empty or price_2.empty or price_3.empty:
                continue

            image_url = df1.loc[df1["Name"] == name, "Image_URL_1"]
            if image_url.empty or pd.isna(image_url.values[0]):
                image_url = df2.loc[df2["Name"] == match2, "Image_URL_2"]
            if image_url.empty or pd.isna(image_url.values[0]):
                image_url = df3.loc[df3["Name"] == match3, "Image_URL_3"]

            link_1 = df1.loc[df1["Name"] == name, "Website_Link_1"]
            link_2 = df2.loc[df2["Name"] == match2, "Website_Link_2"]
            link_3 = df3.loc[df3["Name"] == match3, "Website_Link_3"]

            merged_data.append({
                "name": name,
                "prices": {
                    "New World": {"price": price_1.values[0], "link": link_1.values[0]},
                    "Pak'nSave": {"price": price_2.values[0], "link": link_2.values[0]},
                    "Woolworths": {"price": price_3.values[0], "link": link_3.values[0]}
                },
                "image_url": image_url.values[0] if not image_url.empty else ""
            })

            seen_names.add(name)

    # Final cleanup
    merged_df = pd.DataFrame(merged_data)
    merged_df.to_csv(output_csv, index=False)
    print(f"Merged CSV saved to {output_csv}")

    # Write JSON to default path
    with open(output_json, "w") as json_file:
        json.dump(merged_data, json_file, indent=4)
    print(f"Merged JSON saved to {output_json}")

    # Also write to /database and /web folders
    for folder in ["database", "web"]:
        os.makedirs(folder, exist_ok=True)
        json_path = os.path.join(folder, output_json)
        with open(json_path, "w") as f:
            json.dump(merged_data, f, indent=4)
        print(f"Merged JSON also saved to: {json_path}")

if __name__ == "__main__":
    merge_csvs(
        "newworld_products.csv",
        "paknsave_products.csv",
        "woolworths_products.csv",
        "merged_supermarket_data.csv",
        "merged_supermarket_data.json"
    )
