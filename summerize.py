import requests
import json
from typing import List, Dict

class NewsletterGenerator:
    def __init__(self, api_url: str = "http://172.24.9.19:8080/til-ai/api/generatePrompt/gpt4-mini"):
        self.api_url = api_url
        self.headers = {
            'Content-Type': 'application/json'
        }

    def generate_newsletter(self, news_items: List[str]) -> Dict:
        """
        Generate a newsletter summary from a list of news items.
        
        Args:
            news_items: List of news articles to summarize
            
        Returns:
            Dictionary containing the structured newsletter
        """
        prompt = f"""Create a newsletter summary with the following 6 news items. Format the response as a JSON object with the following structure:

        {{
            "title": "TOI Global Brief",
            "subtitle": "Your world. Decoded.",
            "date": "March 31, 2025",
            "stories": [
                {{
                    "headline": "",
                    "what_happened": "",
                    "why_it_matters": "",
                    "so_what": ""
                }},
                {{
                    "headline": "",
                    "what_happened": "",
                    "why_it_matters": "",
                    "so_what": ""
                }},
                {{
                    "headline": "",
                    "what_happened": "",
                    "why_it_matters": "",
                    "so_what": ""
                }},
                {{
                    "headline": "",
                    "what_happened": "",
                    "why_it_matters": "",
                    "so_what": ""
                }},
                {{
                    "headline": "",
                    "what_happened": "",
                    "why_it_matters": "",
                    "so_what": ""
                }},
                {{
                    "headline": "",
                    "what_happened": "",
                    "why_it_matters": "",
                    "so_what": ""
                }}
            ]
        }}

        Requirements for each story:
        - Headline should be concise and impactful
        - What happened: Brief description of the event
        - Why it matters: Explain the significance and implications
        - So what: Focus on India angle or broader implications
        - Keep each section concise and informative
        - Use emojis to make the newsletter more engaging, dont use too many emojis

        the output should be pure text format so its easy to parse it in the json format
        
        News items to summarize:
        {json.dumps(news_items, indent=2)}
        """

        payload = {
            "prompt": prompt
        }

        try:
            print("Sending request to API...")
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload
            )
            
            # Print response status and content for debugging
            print(f"Response status code: {response.status_code}")
            print(f"Response content: {response.text[:500]}...")  # Print first 500 chars of response
            
            response.raise_for_status()
            
            # Try to parse the response as JSON
            try:
                return response.json()
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON response: {e}")
                print("Raw response content:", response.text)
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Error making API request: {e}")
            if hasattr(e.response, 'text'):
                print(f"Response content: {e.response.text}")
            return None

def format_newsletter(newsletter_data: Dict) -> str:
    """
    Format the newsletter data into a JSON string.
    """
    if not newsletter_data:
        return json.dumps({"error": "Could not generate newsletter"})

    # Create a clean JSON structure
    output_data = {
        "title": newsletter_data.get('title', 'TOI Global Brief'),
        "subtitle": newsletter_data.get('subtitle', 'Your world. Decoded.'),
        "date": newsletter_data.get('date', 'March 31, 2025'),
        "stories": []
    }

    # Process each story
    for story in newsletter_data.get('stories', []):
        story_data = {
            "headline": story.get('headline', ''),
            "what_happened": story.get('what_happened', ''),
            "why_it_matters": story.get('why_it_matters', ''),
            "so_what": story.get('so_what', '')
        }
        output_data["stories"].append(story_data)

    # Convert to JSON string with proper indentation
    return json.dumps(output_data, indent=2, ensure_ascii=False)

def main():
    # Read news data from JSON file
    try:
        print("Reading news.json file...")
        with open('news.json', 'r', encoding='utf-8') as file:
            news_data = json.load(file)
            
        # Extract rawDes from each article
        news_items = [article.get('rawDes', '') for article in news_data]
        print(f"Found {len(news_items)} news items to process")
        
        # Initialize generator and create newsletter
        generator = NewsletterGenerator()
        newsletter_data = generator.generate_newsletter(news_items)
        
        if newsletter_data:
            formatted_newsletter = format_newsletter(newsletter_data)
            print("\nGenerated Newsletter (JSON format):")
            print(formatted_newsletter)
            
            # Save the formatted newsletter to a file
            with open('newsletter_output.json', 'w', encoding='utf-8') as f:
                f.write(formatted_newsletter)
            print("\nNewsletter has been saved to 'newsletter_output.json'")
        else:
            print("Failed to generate newsletter")
            
    except FileNotFoundError:
        print("Error: news.json file not found")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in news.json")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
