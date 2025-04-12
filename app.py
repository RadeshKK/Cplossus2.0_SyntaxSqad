from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import os
import traceback
from sklearn.ensemble import RandomForestClassifier
import joblib

app = Flask(__name__)

# Load the model and scaler
model_path = os.path.join('models', 'generator_rf_model.pkl')
scaler_path = os.path.join('models', 'scaler.pkl')

model = None
scaler = None

print(f"Attempting to load model from: {model_path}")
print(f"Model file exists: {os.path.exists(model_path)}")

try:
    # Try loading with joblib first
    try:
        model = joblib.load(model_path)
        print("Model loaded successfully with joblib")
    except Exception as e:
        print(f"Joblib loading failed: {str(e)}")
        # If joblib fails, try pickle
        with open(model_path, 'rb') as f:
            loaded_data = pickle.load(f)
            print(f"Loaded data type: {type(loaded_data)}")
            
            if isinstance(loaded_data, RandomForestClassifier):
                model = loaded_data
                print("Model loaded successfully with pickle")
            elif isinstance(loaded_data, dict):
                if 'model' in loaded_data:
                    model = loaded_data['model']
                    print("Model found in dictionary")
                elif 'estimator' in loaded_data:
                    model = loaded_data['estimator']
                    print("Model found as estimator in dictionary")
                else:
                    print("Could not find model in dictionary")
                    print(f"Dictionary keys: {loaded_data.keys()}")
            else:
                print(f"Unexpected model type: {type(loaded_data)}")
                # Try to use the loaded data directly if it has predict method
                if hasattr(loaded_data, 'predict'):
                    model = loaded_data
                    print("Using loaded data directly as it has predict method")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    print(f"Traceback: {traceback.format_exc()}")

print(f"Model loaded: {model is not None}")
if model is not None:
    print(f"Model type: {type(model)}")
    print(f"Model has predict method: {hasattr(model, 'predict')}")

try:
    with open(scaler_path, 'rb') as f:
        loaded_data = pickle.load(f)
        print(f"Loaded scaler type: {type(loaded_data)}")
        
        if hasattr(loaded_data, 'transform'):
            scaler = loaded_data
            print("Scaler loaded successfully")
        elif isinstance(loaded_data, dict) and 'scaler' in loaded_data:
            scaler = loaded_data['scaler']
            print("Scaler found in dictionary")
except Exception as e:
    print(f"Error loading scaler: {str(e)}")
    print(f"Traceback: {traceback.format_exc()}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return render_template('index.html', error='Model not loaded. Please check the server logs for details.')

        # Get input values from the form
        data = request.form
        required_fields = ['voltage', 'current', 'frequency', 'load', 'temperature']
        
        # Validate all required fields are present
        for field in required_fields:
            if field not in data:
                return render_template('index.html', error=f'Missing required field: {field}')
        
        # Convert to float and validate values
        try:
            voltage = float(data['voltage'])
            current = float(data['current'])
            frequency = float(data['frequency'])
            load = float(data['load'])
            temperature = float(data['temperature'])
        except ValueError:
            return render_template('index.html', error='Invalid input values. All fields must be numbers.')

        # Create input array
        input_data = np.array([[voltage, current, frequency, load, temperature]])
        print(f"Input data shape: {input_data.shape}")
        print(f"Input data: {input_data}")
        
        # Scale the input data if scaler is available
        if scaler is not None and hasattr(scaler, 'transform'):
            try:
                input_data = scaler.transform(input_data)
                print(f"Scaled input data: {input_data}")
            except Exception as e:
                print(f"Error during scaling: {str(e)}")
                print(f"Traceback: {traceback.format_exc()}")
                # Continue without scaling if there's an error
                pass

        # Make prediction
        try:
            if not hasattr(model, 'predict'):
                return render_template('index.html', error='Loaded model does not have predict method')
                
            prediction = model.predict(input_data)[0]
            print(f"Prediction: {prediction}")
            
            if hasattr(model, 'predict_proba'):
                prediction_proba = model.predict_proba(input_data)[0]
                confidence = max(prediction_proba) * 100
                print(f"Prediction probabilities: {prediction_proba}")
            else:
                confidence = 100.0  # If no probability available, assume 100% confidence

            return render_template('index.html',
                                prediction=str(prediction),
                                confidence=f"{confidence:.2f}%",
                                voltage=voltage,
                                current=current,
                                frequency=frequency,
                                load=load,
                                temperature=temperature)

        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return render_template('index.html', error='Error making prediction. Please check your input values.')

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return render_template('index.html', error=str(e))

if __name__ == '__main__':
    app.run(debug=True) 