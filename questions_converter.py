import sys
import xml.etree.ElementTree as ET
import json

if __name__ == '__main__':
    categories_array = []

    xml_input = sys.stdin.read()
    root = ET.fromstring(xml_input)
    categories_elements = root.findall('Questions/Item')

    for category_element in categories_elements:
        category_questions_array = []

        category_name_element = category_element.find('Key')
        category_name = category_name_element.text

        category_question_elements = category_element.findall('./Value/Question')
        for category_question_el in category_question_elements:
            question_title = category_question_el.find('Content').text
            question_answers = [
                category_question_el.find('Tip1').text,
                category_question_el.find('Tip2').text,
                category_question_el.find('Tip3').text,
                category_question_el.find('Tip4').text,
            ]
            category_question_object = {
                "hints": question_answers,
                "content": question_title
            }
            category_questions_array.append(category_question_object)


        category_object = {
            "name": category_name,
            "questions": category_questions_array
        }
        categories_array.append(category_object)

    output_object = {"categories": categories_array}

    categories_json = json.dumps(output_object, indent=2, ensure_ascii=False)
    print(categories_json)