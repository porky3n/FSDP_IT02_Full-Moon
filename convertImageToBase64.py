import base64
import re

# Function to read image and convert to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Paths to images
payment_1_path = 'private-images/payment-upload/payment-1.jpg'
payment_2_path = 'private-images/payment-upload/payment-2.jpg'
profile_user_1_path = 'private-images/profile-pictures/user-1.jpg'
profile_user_2_path = 'private-images/profile-pictures/user-2.jpg'
profile_child_1_path = 'private-images/profile-pictures/child-1.jpg'
profile_child_2_path = 'private-images/profile-pictures/child-2.jpg'
programme_1_path = 'private-images/programme-pictures/programme-1.jpg'
programme_2_path = 'private-images/programme-pictures/programme-2.png'
programme_1_content_1_path = 'private-images/programme-pictures/programme-1-content-1.png'
programme_2_content_1_path = 'private-images/programme-pictures/programme-2-content-1.jpg'


# Convert images to base64
payment_1_base64 = image_to_base64(payment_1_path)
payment_2_base64 = image_to_base64(payment_2_path)
profile_user_1_base64 = image_to_base64(profile_user_1_path)
profile_user_2_base64 = image_to_base64(profile_user_2_path)
profile_child_1_base64 = image_to_base64(profile_child_1_path)
profile_child_2_base64 = image_to_base64(profile_child_2_path)
programme_1_base64 = image_to_base64(programme_1_path)
programme_2_base64 = image_to_base64(programme_2_path)
programme_1_content_1_base64 = image_to_base64(programme_1_content_1_path)
programme_2_content_1_base64 = image_to_base64(programme_2_content_1_path)

# Read the SQL file
with open('SQL Scripts/dummyData.sql', 'r') as file:
    sql_data = file.read()

# Replace placeholders with base64 images
sql_data = sql_data.replace('PLACEHOLDER_PAYMENT_1', payment_1_base64)
sql_data = sql_data.replace('PLACEHOLDER_PAYMENT_2', payment_2_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROFILE_USER_1', profile_user_1_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROFILE_USER_2', profile_user_2_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROFILE_CHILD_1', profile_child_1_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROFILE_CHILD_2', profile_child_2_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROGRAMME_1', programme_1_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROGRAMME_2', programme_2_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROGRAMME_1_CONTENT_1', programme_1_content_1_base64)
sql_data = sql_data.replace('PLACEHOLDER_PROGRAMME_2_CONTENT_1', programme_2_content_1_base64)

# Write the updated SQL back to the file
with open('SQL Scripts/dummyData.sql', 'w') as file:
    file.write(sql_data)

# # !!! This is to convert the base64 strings back to placeholders in the SQL file !!!

# # Define the placeholders and their corresponding base64 strings
# placeholders = {
#     'PLACEHOLDER_PAYMENT_1': payment_1_base64,
#     'PLACEHOLDER_PAYMENT_2': payment_2_base64,
#     'PLACEHOLDER_PROFILE_USER_1': profile_user_1_base64,
#     'PLACEHOLDER_PROFILE_USER_2': profile_user_2_base64,
#     'PLACEHOLDER_PROFILE_CHILD_1': profile_child_1_path,
#     'PLACEHOLDER_PROFILE_CHILD_2': profile_child_2_base64,
#     'PLACEHOLDER_PROGRAMME_1': programme_1_base64,
#     'PLACEHOLDER_PROGRAMME_2': programme_2_base64,
#     'PLACEHOLDER_PROGRAMME_1_CONTENT_1': programme_1_content_1_base64,
#     'PLACEHOLDER_PROGRAMME_2_CONTENT_1': programme_2_content_1_base64 
# }

# # Read the SQL file
# with open('SQL Scripts/dummyData.sql', 'r') as file:
#     sql_data = file.read()

# # Replace base64 strings with placeholders
# for placeholder, base64_string in placeholders.items():
#     sql_data = re.sub(re.escape(base64_string), placeholder, sql_data)

# # Write the updated SQL back to the file
# with open('SQL Scripts/dummyData.sql', 'w') as file:
#     file.write(sql_data)

print('Done!')