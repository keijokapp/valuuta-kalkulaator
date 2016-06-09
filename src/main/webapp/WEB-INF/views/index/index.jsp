<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="en">
<jsp:include page="../../fragments/head.jsp"/>
<body>
<div id="body" ng-app="kalkulaator">

    <section class="content-wrapper main-content clear-fix">


        <h2 style="margin-bottom: 18px">Valuuta kalkulaator</h2>


        <div id="input">
            <form action="javascript:void(0)" id="currency-form">
                <div>
                    <strong>Kuupäev:</strong><br/>
                    <input type="text" id="currency-date"/>

                </div>
                <div>
                    <strong>Lähteväärtus:</strong><br/>
                    <input type="text" id="currency-amount"/>

                </div>
                <div>
                    <select id="currency-from">
                    </select>
                    <img style="width: 20px; height: 20px; vertical-align: middle;"
                         src="/resources/images/right-arrow.png"/>
                    <select id="currency-to">
                    </select>
                </div>
                <div>
                    <button id="currency-submit">Arvuta</button>
                </div>
            </form>
        </div>

        <div id="output">
            <strong>Tulemused:</strong>
            <table id="result-table">
            </table>
        </div>

    </section>
</div>
<script src="/resources/scripts/app.js"></script>
<jsp:include page="../../fragments/footer.jsp"/>

</body>
</html>
