import pytest
from app.models import db, ChatHistory

def test_post_message_empty(client, auth_headers):
    res = client.post('/api/chatbot/', headers=auth_headers, json={'message': ''})
    assert res.status_code == 400
    assert res.get_json()['error'] == 'Message cannot be empty'

def test_post_message_keywords(client, auth_headers):
    # Test hello keyword
    res = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'hello there!'})
    assert res.status_code == 200
    data = res.get_json()
    assert 'Eco Assistant' in data['bot_message']['message']
    assert data['user_message']['message'] == 'hello there!'

    # Test transport keyword
    res_t = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'tell me about transport'})
    assert res_t.status_code == 200
    assert 'Transportation' in res_t.get_json()['bot_message']['message']

    # Test energy keyword
    res_e = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'how to save energy?'})
    assert res_e.status_code == 200
    assert 'Home energy' in res_e.get_json()['bot_message']['message']

    # Test food keyword
    res_f = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'tell me about diet'})
    assert res_f.status_code == 200
    assert 'Food production' in res_f.get_json()['bot_message']['message']

    # Test waste keyword
    res_w = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'plastic waste'})
    assert res_w.status_code == 200
    assert 'landfills' in res_w.get_json()['bot_message']['message']

    # Test tree keyword
    res_tr = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'what does a tree absorb?'})
    assert res_tr.status_code == 200
    assert 'mature tree absorbs' in res_tr.get_json()['bot_message']['message']

    # Test goal keyword
    res_g = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'how do i earn points?'})
    assert res_g.status_code == 200
    assert 'rewards your habits' in res_g.get_json()['bot_message']['message']

    # Test default/unmatched response
    res_def = client.post('/api/chatbot/', headers=auth_headers, json={'message': 'unmatched random query'})
    assert res_def.status_code == 200
    assert 'great question' in res_def.get_json()['bot_message']['message']

def test_get_chat_history(client, auth_headers):
    # Log two messages
    client.post('/api/chatbot/', headers=auth_headers, json={'message': 'hello'})
    client.post('/api/chatbot/', headers=auth_headers, json={'message': 'hi'})
    
    res = client.get('/api/chatbot/history', headers=auth_headers)
    assert res.status_code == 200
    history = res.get_json()
    # 2 user messages + 2 bot replies = 4 messages total
    assert len(history) >= 4
    assert history[0]['sender'] == 'user'
    assert history[1]['sender'] == 'bot'
