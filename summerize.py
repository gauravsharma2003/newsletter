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
        prompt = f"""Create an engaging newsletter summary with the following 6 news items. Format the response as a JSON object with the following structure:

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

        Here's an example of the desired style and format for each story:

        Example Story:
        {{
            "headline": "🎨 What happened?",
            "what_happened": "Ghibli-style dreams are melting GPUs.\nAfter OpenAI rolled out dreamy image generation in ChatGPT (think Totoro meets tech), users rushed in like Spirited Away bathhouse spirits. The result? A GPU sauna. CEO Sam Altman chimed in on X (formerly known as Twitter), announcing emergency cooldowns—rate limits slapped on image requests as servers began to sweat.\n\nThen came part two of the meltdown saga. Rohan Sahai, product lead for Sora (OpenAI's text-to-video wizardry), shared that even Sora's magical movie reels were feeling the heat. \"Our GPUs are frying,\" he said, as Sora got overwhelmed by a flood of surreal, animated, AI-crafted shorts.",
            "why_it_matters": "🔥 Why it matters?\nGPU overload is the AI version of \"too many cooks in the kitchen.\"\nThese tools are fun, powerful, and wildly popular—which is great! But also… not great if your hardware starts acting like Calcifer in a bad mood. The bottleneck shows the gap between user demand and infrastructure muscle. AI might be magic, but it still needs cold, hard chips to run.",
            "so_what": "🧊 What next?\nHold the prompts—cooldowns in progress.\nAltman says the limitations are temporary. Free users will get 3 image generations per day \"soon,\" once the dust settles and the GPUs stop sizzling. The Sora crew, meanwhile, is racing against time (and thermals) to stabilize the dream machine.\n\nUntil then: expect delays, be kind to your prompts, and maybe imagine your next Ghibli-inspired artwork… in your head."
        }}

        Requirements for each story:
        1. Headline: 
           - Start with a relevant emoji
           - Be concise and impactful
           - Use engaging language

        2. What happened:
           - Start with a relevant emoji
           - Write in a conversational, engaging tone
           - Use vivid language and metaphors
           - Include specific details and quotes when available
           - Break into short, digestible paragraphs
           - Use creative analogies and pop culture references when relevant

        3. Why it matters:
           - Start with a relevant emoji
           - Explain significance in an engaging way
           - Use analogies and relatable examples
           - Connect to broader implications
           - Make complex topics accessible through creative comparisons

        4. So what:
           - Start with a relevant emoji
           - Focus on India angle or broader implications
           - Use a forward-looking perspective
           - End with a thought-provoking statement or question
           - Include practical takeaways or next steps

        Style Guidelines:
        - Use emojis strategically at the start of each section
        - Write in a conversational, engaging tone
        - Use metaphors and analogies to explain complex topics
        - Break content into short, digestible paragraphs
        - Include specific details and quotes when available
        - Make it feel like a friend explaining the news
        - Use vivid language and engaging examples
        - End sections with forward-looking statements or questions
        - Use creative analogies and pop culture references when relevant
        - Make technical topics accessible through relatable comparisons

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
