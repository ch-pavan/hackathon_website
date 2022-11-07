# imports
import tensorflow as tf
import pandas as pd
import numpy as np
import sys
df = pd.read_csv(r"C:\Users\chpav\OneDrive\Desktop\Dr reddy\brand_generator.csv")
df = df.drop(['Therapeutic 1', 'Therapeutic 2', 'Molecules name'], axis=1)
df = df.drop_duplicates()
df = df[df['Country']=='INDIA']
df= df.drop(['Country'], axis=1)


gen_amount = 5 # How many
input_values = []
for value in df['Drug name']:
  input_values.append(value)
concat_names = '\n'.join(input_values).lower()

specialChars = "%&()+-./0123456789>\_` " 
for specialChar in specialChars:
    concat_names = concat_names.replace(specialChar, "")


chars = sorted(list(set(concat_names)))
num_chars = len(chars)




char2idx = dict((c, i) for i, c in enumerate(chars))
idx2char = dict((i, c) for i, c in enumerate(chars))

max_sequence_length = max([len(name) for name in input_values])


model = tf.keras.models.load_model('brand_gen_modelepochs=20v2.h5')
sequence = concat_names[-(max_sequence_length - 1):] + '\n'

new_names = []

while len(new_names) < gen_amount:
    # Vectorize sequence for prediction
    x = np.zeros((1, max_sequence_length, num_chars))
    for i, char in enumerate(sequence):
        x[0, i, char2idx[char]] = 1

    # Sample next char from predicted probabilities
    probs = model.predict(x, verbose=0)[0]
    probs /= probs.sum()
    next_idx = np.random.choice(len(probs), p=probs)
    next_char = idx2char[next_idx]
    sequence = sequence[1:] + next_char

    # New line means we have a new name
    if next_char == '\n':
        gen_name = [name for name in sequence.split('\n')][1]
        
        # Never start name with two identical chars, could probably also
        if len(gen_name) > 2 and gen_name[0] == gen_name[1]:
            gen_name = gen_name[1:]
        
        # Discard all names that are too short
        if len(gen_name) > 2:
            # Only allow new and unique names
            if gen_name not in input_values + new_names:
                new_names.append(gen_name.capitalize())

new_names = list(set(new_names))
print(new_names[0])
sys.stdout.flush()