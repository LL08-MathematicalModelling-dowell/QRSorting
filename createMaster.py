import requests
import json
import time

headers = {
              "Authorization": "Api-Key sk_test_HLsJ5MUqcGvurIfRpKb5uQjHH2eLbhaR5ifxLbXxHbI",
              "Content-Type": "application/json"
          }

def createCollections():
  url = "https://datacube.uxlivinglab.online/api/add_collection/"

  collections = []
  for i in range(1,10000):
      
      coll = {
        "name": "0" * (4 - len(str(i))) + str(i),
        "fields": [
            {
            "name": "orderId",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "scannedAt",
            "type": "string"
          }
        ]
      }
      collections.append(coll)
      print(f"added collection {i} to the list")

      if (i % 300 == 0 and i >= 300) or (i == 9999):
          payload = {
                      "database_id": "695ce92eff84eaf663c457c2",
                      "collections": collections
                  }

          response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
          if response.status_code != 200:
              print(response.text)
              break
          print(response.text)
          collections = []

          time.sleep(10)

def missingCollections():
    url = "https://datacube.uxlivinglab.online/api/get_metadata?database_id=695ce92eff84eaf663c457c2"

    response = requests.request("GET", url, headers=headers)

    if response.status_code == 200:
        data = response.json()["data"]
        collections = data["collections"]
        print("Collections: " + str(len(collections)))
        coll_set = set(int(coll["name"]) for coll in collections)
        # print(coll_set)

        missing_collections = [i for i in range(0,10000) if i not in coll_set]
        print(f"Missing collections: {missing_collections}, count: {len(missing_collections)}")

        return missing_collections
    else:
        print("Error: " + response.text)

def add_missing_collections():
    missing_collections = missingCollections()

    collections = []
    for i in missing_collections:
      
      coll = {
        "name": "0" * (4 - len(str(i))) + str(i),
        "fields": [
            {
            "name": "orderId",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "scannedAt",
            "type": "string"
          }
        ]
      }
      collections.append(coll)

    payload = {
                      "database_id": "695ce92eff84eaf663c457c2",
                      "collections": collections
                  }

    response = requests.request("POST", "https://datacube.uxlivinglab.online/api/add_collection/", headers=headers, data=json.dumps(payload))
    
    print(response.text)

add_missing_collections()
missingCollections()

"""
missing collections: [2701, 2702, 2703, 2705, 2707, 2709, 2710, 2711, 2715, 2716, 2717, 2721, 2722, 2723, 2726, 2727, 2729, 
2732, 2733, 2735, 2737, 2739, 2742, 2743, 2746, 2748, 2751, 2752, 2755, 2760, 2762, 2763, 2764, 2765, 2766, 2769]

"""