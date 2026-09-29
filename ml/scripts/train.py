#!/usr/bin/env python3
"""
CLI entrypoint to train all models and generate artifacts.
Usage: python ml/scripts/train.py
"""

import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, ML_DIR)

from training.train import run_training_pipeline

if __name__ == "__main__":
    run_training_pipeline()
