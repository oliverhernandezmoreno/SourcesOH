#!/usr/bin/python
# Generated by Selenium IDE
import unittest
import os, sys
import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys

class TestLogin(unittest.TestCase):
  def setUp(self):
    options = webdriver.ChromeOptions()
    capabilities = options.to_capabilities()
    self.driver = webdriver.Remote(command_executor='http://127.0.0.1:4444/wd/hub', desired_capabilities=capabilities)
    self.vars = {}

  def tearDown(self):
    self.driver.quit()

  def test_login(self):
    self.driver.get(os.environ.get('URL'))
    self.vars["xpathCount"] = len(self.driver.find_elements(By.XPATH, "//*[@id=\"root\"]/div/div/div[2]/button"))
    print(str(self.vars["xpathCount"]))
    if self.driver.execute_script("return (arguments[0] == 1)", self.vars["xpathCount"]):
      self.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div/div/div[1]/div[1]/div/input").send_keys(os.environ.get('USERNAME'))
      self.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div/div/div[1]/div[2]/div/input").send_keys(os.environ.get('PASSWORD'))
      self.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div/div/div[2]/button").click()
    WebDriverWait(self.driver, 30000).until(expected_conditions.presence_of_element_located((By.XPATH, "//*[@id=\"root\"]/div/main/div[2]/div/div[1]/h5")))
    assert self.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div/main/div[2]/div/div[1]/h5[contains(text(),'Plataforma Tranque')]")
    self.driver.close()

if __name__ == '__main__':
    unittest.main()
