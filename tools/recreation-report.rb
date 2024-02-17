#!/usr/bin/env ruby

require 'httparty'
require 'json'
require 'nokogiri'
require 'selenium-webdriver'
require 'date'
require 'open-uri'

waterbodies = ["ANTELOPE FLAT RESERVOIR", "BIKINI POND", "CENTURY GRAVEL POND", "CRANE PRAIRIE RESERVOIR", "CRESCENT LAKE", "CROOKED RIVER", "DAVIS LAKE", "DESCHUTES RIVER, mouth to Pelton Dam", "DESCHUTES RIVER, Lake Billy Chinook to Benham Falls", "DESCHUTES RIVER, Benham Falls to Little Lava Lake", "EAST LAKE", "FALL RIVER", "HAYSTACK RESERVOIR", "HOOD RIVER", "HOSMER LAKE", "LAKE BILLY CHINOOK", "LAURANCE LAKE", "LAVA LAKE, Big", "METOLIUS RIVER", "NORTH TWIN LAKE", "OCHOCO RESERVOIR", "ODELL LAKE", "PAULINA LAKE", "PINE HOLLOW RESERVOIR", "PINE NURSERY POND", "PRINEVILLE RESERVOIR", "SOUTH TWIN LAKE", "SPRAGUE POND", "TAYLOR LAKE (Wasco County)", "THREE CREEK LAKE", "WALTON LAKE", "WICKIUP RESERVOIR"]

# Replace with your Chrome driver path
# driver_path = "path/to/chromedriver"

# Open Chrome browser
#driver = Selenium::WebDriver.for :chrome

# Navigate to ODFW webpage
#driver.get "https://myodfw.com/recreation-report/fishing-report/central-zone"

# Wait for page to load
#sleep 5

# Find all waterbody headings
#report = driver.find_element(css: ".rec-report-wrapper")

doc = Nokogiri::HTML.parse(URI.open('https://myodfw.com/recreation-report/fishing-report/central-zone'))
report = doc.css(".rec-report-wrapper")


d = Date.today.strftime("%Y-%m-%d")
File.write("report-#{d}.txt", report.text)

#paragraphs = doc.find_elements(:tag_name, 'p')
paragraphs = doc.css('p')

# Initialize empty array for waterbody data
data = []
details = ""
location = nil
# Loop through each waterbody and extract content
paragraphs.each do |paragraph|
  waterbodies.each do |w|
    # found a match
    if paragraph.text.include?(w)
    # push any accumulated location data
      data.push({
            "location": location,
            "details": details
            }) if location
      details = ""
      location = w
    end
  end
  details << paragraph.text if location
end

# Close browser
#driver.quit

# Convert data to JSON and print
json_data = JSON.pretty_generate(data)
File.write("report-#{d}.json", json_data)
