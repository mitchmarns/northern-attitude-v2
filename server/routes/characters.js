// Character routes
const express = require('express');
const router = express.Router();
const characterController = require('../db/models/character');

/**
 * @route   GET /api/characters
 * @desc    Get all characters, optionally filtered by userId
 * @access  Public
 */
router.get('/', characterController.getAllCharacters);

/**
 * @route   GET /api/characters/:id
 * @desc    Get a character by ID
 * @access  Public
 */
router.get('/:id', characterController.getCharacterById);

/**
 * @route   POST /api/characters
 * @desc    Create a new character
 * @access  Public
 */
router.post('/', characterController.createCharacter);

/**
 * @route   PUT /api/characters/:id
 * @desc    Update an existing character
 * @access  Public
 */
router.put('/:id', characterController.updateCharacter);

/**
 * @route   DELETE /api/characters/:id
 * @desc    Delete a character
 * @access  Public
 */
router.delete('/:id', characterController.deleteCharacter);

module.exports = router;