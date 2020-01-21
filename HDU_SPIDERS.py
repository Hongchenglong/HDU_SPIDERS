#!/usr/bin/python
# coding=utf-8
import os
import re
import csv
import time
import json
import pymysql
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from requests.exceptions import RequestException

def parse_Problem_Archive(text):
    soup = BeautifulSoup(text, 'lxml')
    items = soup.find_all(align='center', height='22')
    for i in range(1, len(items)):
        Pro_ID = items[i].td.text #items[i]中第一个td的文本内容
        tags = parse_discuss_page(Pro_ID) 
        tags = ','.join(tags)
#         if len(tags) == 0:
#             continue
        data = {
            'Pro_ID': Pro_ID,
            'Title': items[i].a.text.strip(),
            'Tags': tags, 
            'Ratio': items[i].td.next_sibling.next_sibling.text[:6],
            'Link': 'http://acm.hdu.edu.cn/showproblem.php?pid=' + Pro_ID
        }
        yield data
        
def get_one_page(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) '
            + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.text
        return 'status_code = ' + str(response.status_code)
    except RequestException:
        return 'RequestException'

def parse_discuss_page(Pro_ID):
    url = 'http://acm.hdu.edu.cn/discuss/problem/list.php?problemid=' + str(Pro_ID)
    text = get_one_page(url)
    soup = BeautifulSoup(text, 'lxml')
    discuss = soup.select('#ulframe > li > a:nth-child(2)')
    discuss_list = []
    for dis in discuss:
        discuss_list.append(dis.text)
    discuss_text = '\n'.join(['{nth}.{dis}'.format(nth=nth+1,dis=dis) for nth,dis in enumerate(discuss_list)])
    match = {
        'dp': re.compile('dp', re.I), #re.I使匹配对大小写不敏感
        'water': re.compile('水'),
        'search': re.compile('[d|b]fs', re.I), #[]
        'sort': re.compile('排序'),
        'tree': re.compile('树'),
        'violence': re.compile('暴力')
    }
    tags = []
    for mat in match:
        tags += re.findall(match[mat], discuss_text)
    discuss_text = str(Pro_ID) + ':\n' + discuss_text + '\nEND OF ' + str(Pro_ID) + '.\n\n'
    page = get_page(int(Pro_ID))
    write_to_discuss(path='OUTPUT',page=page,text=discuss_text)
    return set(tags) # 利用set去重

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)
    else:
        return None
    
def get_page(Pro_ID):
    Pro_ID //= 100
    return (Pro_ID//10 - 1) * 10 + (Pro_ID%10 + 1)
    
def write_to_discuss(path, page, text):
    filename = path + '/PAGE' + str(page) + '.txt'
    with open(filename, 'a', encoding='utf-8') as f:
        f.write(text)
        
def write_to_file(item):
    with open('OUTPUT/HDU题目类型.txt', 'a', encoding='utf-8') as f:
        f.write(json.dumps(item, ensure_ascii=False)+'\n')
def write_to_json(content):
    with open('OUTPUT/HDU题目类型.json', 'a', encoding='utf-8') as f:
        f.write(json.dumps(content, ensure_ascii=False)+'\n')
def write_to_csv(content): 
    with open('OUTPUT/HDU题目类型.csv', 'a', encoding='utf-8-sig', newline='') as f:
        #newline=''取消自动换行
        #注意：utf-8还是乱码，得设置为utf-8-sig
        fieldnames = ['Pro_ID', 'Title', 'Tags', 'Ratio', 'Link']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(content)
        
def create_database(database):
    db = pymysql.connect(host='localhost',user='root',password='root',port=3306)
    cursor = db.cursor()
    cursor.execute("CREATE DATABASE " + database + " DEFAULT CHARACTER SET utf8") #创建数据库spiders
    
def create_table(database, table):    
    db = pymysql.connect(host='localhost', user='root', password='root', port=3306, db=database)
    cursor = db.cursor() 
    sql= "CREATE TABLE " + table + " (Pro_ID VARCHAR(255) UNIQUE,Title VARCHAR(255) NOT NULL,Tags VARCHAR(255) NOT NULL,"\
            +"Ratio VARCHAR(255) NOT NULL,Link VARCHAR(255) NOT NULL)"
    cursor.execute(sql) #执行SQL语句，创建数据表HDU
    db.close()
    
def write_to_sql(database, table, data):
    keys = ', '.join(data.keys())
    values = ', '.join(['%s'] * len(data))
    sql = 'INSERT INTO {table}({keys}) VALUES ({values}) ON DUPLICATE KEY UPDATE '.format(table=table, keys=keys, values=values)
    update = ','.join(["{key} = %s".format(key=key) for key in data])
    sql += update 
    db = pymysql.connect(host='localhost', user='root', password='root', port=3306, db=database)
    cursor = db.cursor()
    try:
        if cursor.execute(sql, tuple(data.values())*2):
            print('Successful')
            db.commit()
    except:
        print('Failed')
        db.rollback()
    db.close() 
    
    
def main():
    browser = webdriver.Chrome()
    #Problem Archive页面经动态渲染，requests无法爬取，于是利用selenum模拟浏览器操作，实现所见即所得
    create_dir(path='OUTPUT')
    for i in range(1,59):
        url = 'http://acm.hdu.edu.cn/listproblem.php?vol=' + str(i)
        browser.get(url)
        content = []
        text = browser.page_source
        print('正在爬取第', i, '页')
        for item in parse_Problem_Archive(text):
            print(item)
            #write_to_file(item)
            write_to_sql(database='spiders',table='hdu',data=item)
            content.append(item)
        #write_to_json(content)
        #write_to_csv(content)
        time.sleep(3)
    browser.close()
      
if __name__ == "__main__":  
    #第一次创建时使用
    #create_database(database='spiders') 
    #create_table(database='spiders',table='hdu')
    main()
