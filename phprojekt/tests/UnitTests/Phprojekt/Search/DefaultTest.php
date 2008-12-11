<?php
/**
 * Unit test
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
 * @copyright  Copyright (c) 2007 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    CVS: $Id:
 * @link       http://www.phprojekt.com
 * @since      File available since Release 1.0
 */
require_once 'PHPUnit/Framework.php';

/**
 * Tests for Default Search class
 *
 * @copyright  Copyright (c) 2007 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    Release: @package_version@
 * @link       http://www.phprojekt.com
 * @since      File available since Release 1.0
 * @author     Eduardo Polidor <polidor@mayflower.de>
 */
class Phprojekt_Search_DefaultTest extends PHPUnit_Framework_TestCase
{
    /**
     * Test index
     */
    public function testIndex()
    {
        $project = new Project_Models_Project();
        $project->title = 'CCCC DDDD TTTT';
        $project->path = '/1/';
        $project->ownerId = 1;
        $project->projectId = 1;
        $project->save();

        $search = new Phprojekt_Search_Default();
        $result = $search->search('CCCC');
        Zend_Registry::get('log')->debug('testIndex 1');
        foreach ($result as $k => $v) {
            Zend_Registry::get('log')->debug($k .'=>'. $v);
            foreach ($v as $v1 => $v2) {
                Zend_Registry::get('log')->debug($v1 .'=>'. $v2);
            }
        }
        $this->assertEquals(1, count($result));

        $result = $search->search('CCCC DDDD');
        Zend_Registry::get('log')->debug('testIndex 2');
        foreach ($result as $k => $v) {
            Zend_Registry::get('log')->debug($k .'=>'. $v);
            foreach ($v as $v1 => $v2) {
                Zend_Registry::get('log')->debug($v1 .'=>'. $v2);
            }
        }
        $this->assertEquals(1, count($result));
    }

    /**
     * Test search
     */
    public function testSearch()
    {
        $search = new Phprojekt_Search_Default();
        $result = (array)$search->search('CCCC DDDD');
        Zend_Registry::get('log')->debug('testSearch 1');
        foreach ($result as $k => $v) {
            Zend_Registry::get('log')->debug($k .'=>'. $v);
            foreach ($v as $v1 => $v2) {
                Zend_Registry::get('log')->debug($v1 .'=>'. $v2);
            }
        }
        $this->assertEquals(1, count($result));

        $result = (array)$search->search('HELLO CCCC');
        Zend_Registry::get('log')->debug('testSearch 2');
        foreach ($result as $k => $v) {
            Zend_Registry::get('log')->debug($k .'=>'. $v);
            foreach ($v as $v1 => $v2) {
                Zend_Registry::get('log')->debug($v1 .'=>'. $v2);
            }
        }
        $this->assertEquals(2, count($result));

        $result = (array)$search->search('HEL CCC');
        Zend_Registry::get('log')->debug('testSearch 3');
        foreach ($result as $k => $v) {
            Zend_Registry::get('log')->debug($k .'=>'. $v);
            foreach ($v as $v1 => $v2) {
                Zend_Registry::get('log')->debug($v1 .'=>'. $v2);
            }
        }
        $this->assertEquals(2, count($result));
    }

    /**
     * Test delete
     */
    public function testDelete()
    {
        $project = new Project_Models_Project();
        $project->find(11);

        $search = new Phprojekt_Search_Default();
        $search->deleteObjectItem($project);

        $result = (array)$search->search('CCCC DDDD TTTT');
        $this->assertEquals(0, count($result));
    }
}