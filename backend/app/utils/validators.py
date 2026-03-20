import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    return len(password) >= 6

def validate_prediction_input(data):
    """Validate prediction input fields"""
    required_fields = ['glucose', 'blood_pressure', 'bmi', 'age']
    
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}'
        
        try:
            float(data[field])
        except (TypeError, ValueError):
            return False, f'Invalid value for {field}: must be a number'

    optional_numeric_fields = [
        'hba1c', 'waist', 'insulin', 'skin_thickness', 'pregnancies',
        'diabetes_pedigree_function', 'family_history'
    ]

    for field in optional_numeric_fields:
        if field in data and data[field] is not None and data[field] != '':
            try:
                float(data[field])
            except (TypeError, ValueError):
                return False, f'Invalid value for {field}: must be a number'
    
    return True, None
