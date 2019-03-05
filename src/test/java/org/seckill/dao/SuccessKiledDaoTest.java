package org.seckill.dao;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.seckill.entity.SuccessKilled;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.annotation.Resource;

import static org.junit.Assert.assertEquals;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/spring-dao.xml")
public class SuccessKiledDaoTest {

    @Resource
    private SuccessKilledDao successKilledDao;

    @Test
    public void testInsertSuccessKilled() {
        long id = 1000L;
        long phone = 12345678L;
        int insertCount = successKilledDao.insertSuccessKilled(id, phone);
        assertEquals(1, insertCount);
        int count = successKilledDao.insertSuccessKilled(id, phone);
        assertEquals(0, count);
    }

    @Test
    public void testQueryByIdWithSeckill() {
        long id = 1000L;
        long phone = 12345678L;
        SuccessKilled successKilled = successKilledDao.queryByIdWithSeckill(id, phone);
        assertEquals(1000L, successKilled.getSeckillId());
        assertEquals(12345678L, successKilled.getUserPhone());
        assertEquals("秒杀1", successKilled.getSeckill().getName());
    }
}
