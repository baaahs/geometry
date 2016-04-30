#!/usr/bin/env ruby

require 'net/http'
require 'uri'
require 'json'
require 'date'
require 'time'

def to_pdt(s)
  (Time.parse(s) - 7 * 60 * 60).strftime("%H:%M")
end

puts "Dawn\tSunrise\tSunset\tDusk\tDate\tDay"

dates = [
    ["2016-08-22", "Early Mon"],
    ["2016-08-23", "Early Tue"],
    ["2016-08-24", "Early Wed"],
    ["2016-08-25", "Early Thu"],
    ["2016-08-26", "Early Fri"],
    ["2016-08-27", "Early Sat"],
    ["2016-08-28", "Early Sun"],
    ["2016-08-29", "Mon"],
    ["2016-08-30", "Tue"],
    ["2016-08-31", "Wed"],
    ["2016-09-01", "Thu"],
    ["2016-09-02", "Fri"],
    ["2016-09-03", "Sat"],
    ["2016-09-04", "Sun"],
    ["2016-09-05", "Mon"],
]
dates.each do |(date, day)|
  response = Net::HTTP.get_response(URI.parse("http://api.sunrise-sunset.org/json?lat=40.7886&lng=-119.203&date=#{date}"))
  results = JSON.parse(response.body)["results"]

  puts "#{to_pdt(results["civil_twilight_begin"])}" \
      "\t#{to_pdt(results["sunrise"])}" \
      "\t#{to_pdt(results["sunset"])}" \
      "\t#{to_pdt(results["civil_twilight_end"])}" \
      "\t#{date}\t#{day}"
end
