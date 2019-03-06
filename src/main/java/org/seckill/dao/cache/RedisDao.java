package org.seckill.dao.cache;

import com.dyuproject.protostuff.LinkedBuffer;
import com.dyuproject.protostuff.ProtostuffIOUtil;
import com.dyuproject.protostuff.runtime.RuntimeSchema;
import org.seckill.entity.Seckill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisDao {

    private JedisPool jedisPool;

    private final Logger logger = LoggerFactory.getLogger(this.getClass());


    public RedisDao(String ip, int port) {
        jedisPool = new JedisPool(ip, port);
    }

    private RuntimeSchema<Seckill> schema = RuntimeSchema.createFrom(Seckill.class);

    public Seckill getSeckill(long seckillId) {
        try {
            try (Jedis jedis = jedisPool.getResource()) {
                String key = "seckill:" + seckillId;
                byte[] bytes = jedis.get(key.getBytes());
                if (bytes != null) {
                    Seckill seckill = schema.newMessage();
                    // seckill被反序列化
                    ProtostuffIOUtil.mergeFrom(bytes, seckill, schema);
                    return seckill;
                }
            }
        } catch (Exception e){
            logger.error(e.getMessage(), e);
        }
        return null;
    }

    public String putSeckill(Seckill seckill) {
        try {
            try (Jedis jedis = jedisPool.getResource()) {
                String key = "seckill:" + seckill.getSeckillId();
                // seckill 序列化
                byte[] bytes = ProtostuffIOUtil.toByteArray(seckill, schema,
                        LinkedBuffer.allocate(LinkedBuffer.DEFAULT_BUFFER_SIZE));
                int time = 60 * 60;
                return jedis.setex(key.getBytes(), time, bytes);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }
}
