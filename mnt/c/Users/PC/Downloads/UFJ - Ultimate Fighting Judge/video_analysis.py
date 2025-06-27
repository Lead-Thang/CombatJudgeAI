import sys
import json
import random
import time

def analyze_video(video_path):
    """Mock function to simulate video analysis with AI"""
    # Simulate processing time
    time.sleep(2)
   
    # Get filename from path
    filename = video_path.split('/')[-1] if '/' in video_path else video_path.split('\\\\')[-1]
   
    # Generate mock fight statistics
    fighter_a_strikes = random.randint(80, 150)
    fighter_b_strikes = random.randint(60, 130)
   
    fighter_a_takedowns = random.randint(2, 7)
    fighter_b_takedowns = random.randint(0, 4)
   
    total_rounds = 3
    rounds = []
   
    for i in range(total_rounds):
        round_data = {
            'round': i + 1,
            'fighterA_strikes': random.randint(20, 50),
            'fighterB_strikes': random.randint(15, 40),
            'fighterA_takedowns': random.randint(0, 3),
            'fighterB_takedowns': random.randint(0, 2),
            'fighterA_controlTime': random.randint(60, 240),
            'fighterB_controlTime': random.randint(30, 180),
            'scoreA': random.randint(9, 10),
            'scoreB': random.randint(8, 10) if i < total_rounds - 1 else random.randint(7, 9),
            'fighterA_damage': min(95, random.randint(10, 80) + i * 10),
            'fighterB_damage': min(95, random.randint(10, 80) + i * 10)
        }
        rounds.append(round_data)
   
    # Determine winner based on simulated stats
    a_score = sum(r['scoreA'] for r in rounds)
    b_score = sum(r['scoreB'] for r in rounds)
    winner = "Jon Jones" if a_score > b_score else "Francis Ngannou"
   
    # Mock video metadata
    video_metadata = {
        'title': f"{filename}",
        'duration': 25 * 60 + 30,  # seconds
        'resolution': "1920x1080",
        'fps': 30
    }
   
    # Mock fighter stats
    fighter_a_stats = {
        'name': "Jon Jones",
        'strikes': fighter_a_strikes,
        'takedowns': fighter_a_takedowns,
        'controlTime': sum(r['fighterA_controlTime'] for r in rounds),
        'damage': max(r['fighterA_damage'] for r in rounds)
    }
   
    fighter_b_stats = {
        'name': "Francis Ngannou",
        'strikes': fighter_b_strikes,
        'takedowns': fighter_b_takedowns,
        'controlTime': sum(r['fighterB_controlTime'] for r in rounds),
        'damage': max(r['fighterB_damage'] for r in rounds)
    }
   
    # Generate summary
    summary = f"{winner} won the fight with superior striking accuracy and cage control. "
    summary += f"{fighter_a_stats['name']} showed better technique with {fighter_a_stats['strikes']} strikes and "
    summary += f"{fighter_a_stats['takedowns']} takedowns compared to {fighter_b_stats['name']}'s "
    summary += f"{fighter_b_stats['strikes']} strikes and {fighter_b_stats['takedowns']} takedowns."
   
    return {
        'videoMetadata': video_metadata,
        'fighterA': fighter_a_stats,
        'fighterB': fighter_b_stats,
        'winner': winner,
        'summary': summary,
        'rounds': rounds
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Error: No video file path provided")
        sys.exit(1)
   
    video_path = sys.argv[1]
    result = analyze_video(video_path)
    print(json.dumps(result))