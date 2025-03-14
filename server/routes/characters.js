// Character routes
const express = require('express');
const router = express.Router();
const Character = require('../db/models/character');

/**
 * @route   GET /api/characters
 * @desc    Get all characters, optionally filtered by userId
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId || null;
    const characters = await Character.findAll(userId);
    res.json(characters);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/characters/:id
 * @desc    Get a character by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const character = await Character.findById(parseInt(req.params.id));
    res.json(character);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/characters
 * @desc    Create a new character
 * @access  Public
 */
router.post('/', async (req, res, next) => {
  try {
    const result = await Character.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/characters/:id
 * @desc    Update an existing character
 * @access  Public
 */
router.put('/:id', async (req, res, next) => {
  try {
    const result = await Character.update(parseInt(req.params.id), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/characters/:id
 * @desc    Delete a character
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Character.delete(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;