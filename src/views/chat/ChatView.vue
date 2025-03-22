<template>
    <MainLayout>
        {{ authStore.loadUser }}
        <div class="loading-main" v-if="isLoading">
            Loading...
        </div>
        <div class="content-container mx-auto" v-else>
            <div class="content-header mt-10">
                <h2 class="text-4xl mb-5 font-bold">Chat</h2>
                <!-- <p style="color:gray;">
                    Jump back in, or start something new.
                </p> -->
            </div>



            <div class="chat-wrapper mt-5">


                <div class="chat-inner">
                    <div class="grid grid-cols-12">
                        <div class="chat-list col-span-4 pt-10">
                            <div class="chat-list-head flex items-center gap-3">
                                <div class="chat-list-img">

                                </div>
                                <div class="chat-list-text">
                                    <p>Artey</p>
                                </div>


                            </div>

                            <div class="chat-list-head">
                                <div class="chat-list-search mt-5" style="position: relative;">
                                    <div class="search-icon" style="position: absolute;left:20px;top:12px;">
                                        <i class="material-icons">search</i>
                                    </div>
                                    <input type="text"
                                        style="border:1px solid #ccc;height:45px;width:100%;border-radius:30px;font-size:14px;padding-left:60px;box-sizing: border-box;"
                                        placeholder="Search Contact">
                                </div>
                            </div>

                            <div class="chat-list-head">
                                <h3 class="text-sm text-gray-400 mt-5">Recent Chats</h3>
                            </div>

                            <div class="chat-list-sideTab mt-5">
                                <div class="sideTab-item flex p-4" v-for="n in 3" :key="n"
                                    :class="{ 'side-active': n === 1 }">
                                    <div class="chat-list-img mr-3"></div>
                                    <div class="chat-list-text">
                                        <div>Todsapon</div>
                                        <div class="text-xs">Lorem ipsum dolor sit amet consectetur adipisicing</div>
                                    </div>
                                </div>

                            </div>

                        </div>
                        <div class="chat-main col-span-8" style="position: relative;">
                            <div class="chat-main-head">
                                <div class="chat-main-user flex items-center p-5" style="border-bottom:1px solid #eee;">
                                    <div class="chat-list-img me-2 mt-5">

                                    </div>
                                    <div class="chat-list-text">
                                        Todsapon
                                    </div>
                                </div>

                                <div class="chat-main-content p-5" style="overflow: scroll; height:600px;width:100%;">
                                    <div class="chat-main-content-text mb-2 flex" v-for="n in 5" :key="n"
                                        :class="n % 2 === 0 ? 'justify-start' : 'justify-end'">
                                        <div class="chat-list-img mr-2"></div>
                                        <div class="chat-list-text">
                                            <span>{{ n % 2 === 0 ? 'Todsapon' : 'Me' }}</span>
                                            <p class="p-2 text-xs"
                                                style="border-radius:10px;background-color: #eee;text-wrap:wrap;width:200px;">
                                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga accusamus,
                                                ea eos dolorum facere adipisci eius voluptate saepe totam provident,
                                                molestiae dolore expedita nisi, cumque rem suscipit laboriosam aut ab!

                                            </p>
                                        </div>
                                    </div>
                                    <br><br><br><br>

                                </div>




                                <div class="chat-main-bottom flex items-center"
                                    style="background-color:#fff;overflow:hidden;position: absolute;bottom:0;left:0;border-top:1px solid #eee;width:100%;height:80px;">
                                    <div class="chat-main-input flex justify-between items-center p-3"
                                        style="width:100%;padding:0 30px;position: absolute;bottom:35px;">
                                        <div class="input-box" style="width:100%;">
                                            <input type="text" placeholder="Enter your message..." style="width:100%;">
                                        </div>
                                        <div class="input-box" style="position: relative;top:5px;color:#000;">
                                            <button class="text-3xl">></button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>


            </div>






        </div>







    </MainLayout>
</template>


<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
import { ref } from 'vue';

const isLoading = ref(false);

const courses = ref([
    {
        title: 'Web App Development',
        description: 'เรียนรู้การสร้างเว็บแอปพลิเคชันด้วย Vue.js, React และ Node.js ตั้งแต่พื้นฐานจนถึงระดับสูง'
    },
    {
        title: 'Data Analysis with Python',
        description: 'วิเคราะห์ข้อมูลด้วย Python พร้อมใช้งาน Pandas, NumPy และ Matplotlib สำหรับการวิเคราะห์เชิงลึก'
    },
    {
        title: 'Gamified LMS Development',
        description: 'ออกแบบและพัฒนา Learning Management System (LMS) ที่มี Gamification เพื่อเสริมสร้างการเรียนรู้'
    },
    {
        title: 'UX/UI Design Fundamentals',
        description: 'เข้าใจหลักการออกแบบ UX/UI สร้างอินเทอร์เฟซที่ใช้งานง่าย และปรับปรุงประสบการณ์ผู้ใช้ด้วยแนวคิดที่ทันสมัย'
    },
    {
        title: 'Machine Learning Basics',
        description: 'ปูพื้นฐาน Machine Learning ด้วย Python และ Scikit-Learn ฝึกสร้างโมเดลและทดสอบการทำงานของอัลกอริธึม'
    }
])

const assignments = ref([
    {
        course: 'Web App Development',
        title: 'สร้าง Web App สำหรับ To-Do List',
        description: 'พัฒนาเว็บแอป To-Do List โดยใช้ Vue.js หรือ React พร้อมเพิ่มฟีเจอร์ CRUD (Create, Read, Update, Delete)'
    },
    {
        course: 'Data Analysis with Python',
        title: 'วิเคราะห์ชุดข้อมูลยอดขาย',
        description: 'ใช้ Pandas และ Matplotlib วิเคราะห์แนวโน้มยอดขายจากชุดข้อมูล CSV และสรุปผลในรูปแบบกราฟ'
    },
    {
        course: 'Gamified LMS Development',
        title: 'ออกแบบระบบ Gamification',
        description: 'ออกแบบและนำเสนอไอเดีย Gamification เช่น ระบบแต้ม, Leaderboard, หรือ Badge สำหรับ LMS'
    },
    {
        course: 'UX/UI Design Fundamentals',
        title: 'ออกแบบ Prototype สำหรับแอปมือถือ',
        description: 'ใช้ Figma หรือ Adobe XD ออกแบบ UI สำหรับแอปพลิเคชันที่เน้น UX ที่ดี และทดสอบกับผู้ใช้'
    },
    {
        course: 'Machine Learning Basics',
        title: 'สร้างโมเดลทำนายราคาบ้าน',
        description: 'ใช้ Scikit-Learn สร้างโมเดล Machine Learning เพื่อทำนายราคาบ้านจากชุดข้อมูลที่กำหนด'
    }
])


</script>

<style scoped>
.loading-main {
    font-family: 'IBM Plex Mono', serif;
    background-color: #fff;
    width: 500px;
    margin: 0 auto;
    text-align: center;
    padding: 10px;
    border-radius: 20px;
    margin-top: 100px;
}

.content-container {
    max-width: 1140px;
    padding: 0 15px;
}

.chat-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 15px;
    height: 700px;
    overflow: hidden;
}

.chat-list {
    border-right: 1px solid #e5e7eb;

}

.chat-list-img {
    width: 50px;
    height: 50px;
    background-color: gray;
    border-radius: 50%;
}


.chat-list-text {
    white-space: nowrap;

    overflow: hidden;
    text-overflow: ellipsis;
    width: 200px;
}

.chat-list-head {
    width: 90%;
    margin: 0 auto;
}

.side-active {
    background-color: #eee;
}

input:focus {
    outline: none;
}
</style>