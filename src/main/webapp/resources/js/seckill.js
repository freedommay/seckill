// 存放主要交互逻辑js代码
// 模块化
var seckill = {
        URL: {
            now: function () {
                return '/seckill/time/now'
            },
            exposer: function (seckillId) {
                return '/seckill/' + seckillId + '/exposer';
            },
            execution: function (seckillId, md5) {
                return '/seckill/' + seckillId + '/' + md5 + '/execution';
            }
        },

        handleSeckill: function (seckillId, node) {
            node.hide().html('<button class="btn btn-primary btn-lg" id="killBtn">开始秒杀</button>');
            $.post(seckill.URL.exposer(seckillId), {}, function (result) {
                // 在回调函数中，执行交互流程
                if (result && result['success']) {
                    var exposer = result['data'];
                    if (exposer['exposed']) {
                        // 开启秒杀
                        var md5 = exposer['md5'];
                        var killUrl = seckill.URL.execution(seckillId, md5);
                        $('#killBtn').one('click', function () {
                            // 执行秒杀请求
                            // 1.先禁用按钮
                            $(this).addClass('disabled');
                            // 2.发送秒杀请求
                            $.post(killUrl, {}, function (result) {
                                if (result && result['success']) {
                                    var killResult = result['data'];
                                    var stateInfo = killResult['stateInfo'];
                                    // 3.显示秒杀结果
                                    node.html('<span class="label label-success">' + stateInfo + '</span>');
                                }
                            });
                        });
                        node.show();
                    } else {
                        // 未开启秒杀
                        var now = exposer['now'];
                        var start = exposer['start'];
                        var end = exposer['end'];
                        // 重新计算计时逻辑
                        seckill.countdown(seckillId, now, start, end);
                    }
                } else {
                    console.log('result=' + result);
                }
            });
        },

        validatePhone: function (phone) {
            return !!(phone && phone.length == 11 && !isNaN(phone));
        },

        countdown: function (seckillId, nowTime, startTime, endTime) {
            var seckillBox = $('#seckillBox');
            if (nowTime > endTime) {
                seckillBox.html('秒杀结束!');
            } else if (nowTime < startTime) {
                // 开始计时
                var killTime = new Date(startTime + 1);
                seckillBox.countdown(killTime, function (event) {
                    // 控制时间格式
                    var format = event.strftime('秒杀倒计时： %D天 %H时 %M分 %S秒');
                    seckillBox.html(format);
                }).on('finish.countdown', function () {
                    // 获取秒杀地址，控制显示逻辑，执行秒杀
                    seckill.handleSeckill(seckillId, seckillBox);
                });
            } else {
                seckill.handleSeckill(seckillId, seckillBox);
            }
        },

        detail: {
            init: function (params) {
                // 手机验证和登录
                var killPhone = $.cookie('killPhone');
                var startTime = params['startTime'];
                var endTime = params['endTime'];
                var seckillId = params['seckillId'];
                // 验证手机号
                if (!seckill.validatePhone(killPhone)) {
                    var killPhoneModal = $('#killPhoneModal');
                    killPhoneModal.modal({
                        show: true, // 显示弹出层
                        backdrop: 'static', // 禁止位置关闭
                        keyboard: false // 关闭键盘事件
                    });

                    $('#killPhoneBtn').click(function () {
                        var inputPhone = $('#killPhoneKey').val();
                        if (seckill.validatePhone(inputPhone)) {
                            console.log(inputPhone);
                            $.cookie('killPhone', inputPhone, {expire: 7, path: '/seckill'});
                            console.log($.cookie('killPhone'));
                            window.location.reload();
                        } else {
                            $('#killphoneMessage').hide().html('<label class="label label-danger">手机号错误</label>').show(300);
                        }
                    });
                }
                // 已经登录，开始计时
                $.get(seckill.URL.now(), {}, function (result) {
                    if (result && result['success']) {
                        var nowTime = result['data'];
                        seckill.countdown(seckillId, nowTime, startTime, endTime);
                    }
                })
            }
        }
    }
;