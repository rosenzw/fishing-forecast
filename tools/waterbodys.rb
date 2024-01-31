#!/usr/bin/env ruby

require 'httparty'
require 'json'
require 'nokogiri'
require 'selenium-webdriver'

driver = Selenium::WebDriver.for :chrome
url = "http://myodfw.com/fishing/species/trout/stocking-schedule"
driver.manage.timeouts.implicit_wait = 30
driver.navigate.to "https://myodfw.com/fishing/species/trout/stocking-schedule"
table = driver.find_element(css: '.tablesaw')
rows = table.find_elements(tag_name: 'tr')
waterbodies = []
rows.each_with_index do |row, index|
    # Skip header row
    next if index.zero?

    cells = row.find_elements(tag_name: 'td')
    waterbody = cells[1].text.strip  # Extract waterbody name from 2nd column
    waterbodies << waterbody
end

# Create JSON structure
json_data = { waterbodies: waterbodies }.to_json

File.open("waterbodies.json", "w") do |file| file.write(json_data) end

