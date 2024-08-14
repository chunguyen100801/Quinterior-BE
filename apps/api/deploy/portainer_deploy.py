import json
import sys
import requests
from requests.auth import HTTPBasicAuth

def main():
    try:
        url = sys.argv[1]
        api_key = sys.argv[2]
        endpoint = int(sys.argv[3])
        stack = int(sys.argv[4])
        commitId = sys.argv[5]

        # Get stack environment variables
        print("Getting stack environment variables...")
        stack_data_response = requests.get(
            f"{url}/stacks/{stack}",
            headers={"X-API-Key": api_key}
        )
        stack_data_response.raise_for_status()  # Raise an exception for non-200 status codes
        stack_data = stack_data_response.json()
        print("Stack data:", stack_data)

        # Get stack file
        print("Getting stack file...")
        stack_file_response = requests.get(
            f"{url}/stacks/{stack}/file",
            headers={"X-API-Key": api_key}
        )
        stack_file_response.raise_for_status()
        stack_file = stack_file_response.json()

        pattern = r"public_assets_([\w\d]+)"
        stack_file_content = stack_file["StackFileContent"]
        print("Stack file:", stack_file_content)

        # Update stack and repull image
        print("Updating stack and repulling image...")
        update_response = requests.put(
            f"{url}/stacks/{stack}?endpointId={endpoint}",
            headers={"X-API-Key": api_key, "Content-Type": "application/json"},
            json={
                "StackFileContent": stack_file_content,
                "Env": stack_data["Env"],
                "Prune": True,
                "PullImage": True
            }
        )
        update_response.raise_for_status()
        print("Response status:", update_response)
        print("Update status:", update_response.status_code)

    except Exception as error:
        print(f"Failed: {str(error)}")

if __name__ == "__main__":
    main()
