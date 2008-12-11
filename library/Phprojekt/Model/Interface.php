<?php
/**
 * A generic interface to interact with models.
 *
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 2.1 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * @copyright  2007 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    CVS: $Id$
 * @author     Eduardo Polidor <polidor@mayflower.de>
 * @package    PHProjekt
 * @subpackage Core
 * @link       http://www.phprojekt.com
 * @since      File available since Release 1.0
 */

/**
 * The model interface describes the smallest set of methods that must
 * be provided by a model. All core components that donnot deal with a specific
 * interface should use this interface to interact with an object.
 *
 * @copyright  2007 Mayflower GmbH (http://www.mayflower.de)
 * @version    Release: @package_version@
 * @license    LGPL 2.1 (See LICENSE file)
 * @author     Eduardo Polidor <polidor@mayflower.de>
 * @package    PHProjekt
 * @subpackage Core
 * @link       http://www.phprojekt.com
 * @since      File available since Release 1.0
 */
interface Phprojekt_Model_Interface extends Iterator
{
    /**
     * Returns an object that implements the model information interface
     * and that provides detailed information about the fields and their
     * types. For database objects implementing Phprojekt_Item this
     * ModelInformation implementation is usually the DatabaseManager
     *
     * @return Phprojekt_ModelInformation_Interface
     */
    public function getInformation();

    /**
     * Find a dataset, usually by an id. If the record is found
     * the current object is filled with the data and returns itself.
     *
     * @return Phprojekt_Model_Interface
     */
    public function find();

    /**
     * Fetch a set of records. Depending on the implementation
     * it might be possible to limit the fetch by e.g. providing a where clause.
     * A model _neednot_ to implement a limiting mechanism.
     *
     * @return array
     */
    public function fetchAll();

    /**
     * Save the current object to the backend
     *
     * @return boolean
     */
    public function save();

    /**
     * Validate the data of the current record
     *
     * @return boolean
     */
    public function recordValidate();

    /**
     * Get the rigths for other users
     *
     * @return array
     */
    public function getRights();
}