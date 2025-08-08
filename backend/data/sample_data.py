import pandas as pd

df = pd.read_csv('fees.csv')
df.to_json('fees.json', orient='records', indent=2)
