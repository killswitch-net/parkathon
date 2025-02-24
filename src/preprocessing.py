import pandas as pd
import holidays
from datetime import datetime

# splits df into two dataframes, one for the start (label 0) and one for the end of the trips (label 1)
def preprocess(df):
    df1 = pd.DataFrame()
    df2 = pd.DataFrame()

    df1['time'] = pd.to_datetime(df['start_time'])
    df1[['conditions', 'temperature']] = df['start_weather'].str.extract(r'(\w+)\s+(\d+)C')
    df1['conditions'] = df1['conditions'].astype(str)
    df1['conditions'] = df1['conditions'].astype('category').cat.codes.astype(int)
    df1['temperature'] = df1['temperature'].astype(int)
    df1['isFree'] = False

    if df['end_time'].notnull().any():
        df2 = df[df['end_time'].notnull()].copy()
        df2['time'] = pd.to_datetime(df2['end_time'])
        df2[['conditions', 'temperature']] = df2['end_weather'].str.extract(r'(\w+)\s+(\d+)C')
        df2['conditions'] = df2['conditions'].astype(str)
        df2['conditions'] = df2['conditions'].astype('category').cat.codes.astype(int)
        df2['temperature'] = df2['temperature'].astype(int)
        df2['isFree'] = True
    else:
        df2 = None

    return df1, df2

# creates new features out of a timestamp
def add_features(df):
    df['isWeekend'] = df['time'].dt.dayofweek >= 5
    df['isHoliday'] = df['time'].dt.date.apply(lambda x: x in holidays.GR())  # Fix holiday check
    df['season']    = df['time'].dt.month % 12 // 3 + 1  # 1: Winter, 2: Spring, 3: Summer, 4: Fall
    df['year']      = df['time'].dt.year
    df['day']       = df['time'].dt.dayofweek
    df['hour']      = df['time'].dt.hour
    return df